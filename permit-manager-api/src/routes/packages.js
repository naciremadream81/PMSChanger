const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, canAccessPackage } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Validation rules for package creation/update
const packageValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title is required and must be less than 255 characters'),
  body('permitType')
    .isIn(['RESIDENTIAL', 'MOBILE_HOME', 'MODULAR_HOME'])
    .withMessage('Permit type must be RESIDENTIAL, MOBILE_HOME, or MODULAR_HOME'),
  body('countyId')
    .isInt({ min: 1 })
    .withMessage('Valid county ID is required'),
  body('customerId')
    .isUUID()
    .withMessage('Valid customer ID is required'),
  body('contractorId')
    .isUUID()
    .withMessage('Valid contractor ID is required'),
  body('parcelNumber')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Parcel number must be less than 100 characters'),
  body('floodZone')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Flood zone must be less than 10 characters'),
  body('windExposure')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Wind exposure must be less than 10 characters'),
  body('zoningApprovalRef')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Zoning approval reference must be less than 100 characters'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('siteAddress')
    .optional()
    .isObject()
    .withMessage('Site address must be an object'),
  body('siteAddress.line1')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Address line 1 is required and must be less than 255 characters'),
  body('siteAddress.city')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('City is required and must be less than 100 characters'),
  body('siteAddress.state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('State must be exactly 2 characters'),
  body('siteAddress.zip')
    .optional()
    .trim()
    .isLength({ min: 5, max: 10 })
    .withMessage('ZIP code must be between 5 and 10 characters'),
];

// Get all packages with pagination and filtering
router.get('/', authenticateToken, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('q').optional().trim().isLength({ max: 255 }).withMessage('Search query too long'),
  query('status').optional().isArray().withMessage('Status must be an array'),
  query('countyId').optional().isInt({ min: 1 }).withMessage('County ID must be a positive integer'),
  query('dueBefore').optional().isISO8601().withMessage('Due before must be a valid date'),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please check your query parameters',
        details: errors.array(),
      });
    }

    const {
      page = 1,
      limit = 20,
      q,
      status,
      countyId,
      dueBefore,
    } = req.query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    // Search query
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { customer: { name: { contains: q, mode: 'insensitive' } } },
        { contractor: { companyName: { contains: q, mode: 'insensitive' } } },
        { parcelNumber: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Status filter
    if (status && status.length > 0) {
      where.status = { in: status };
    }

    // County filter
    if (countyId) {
      where.countyId = parseInt(countyId);
    }

    // Due date filter
    if (dueBefore) {
      where.dueDate = { lte: new Date(dueBefore) };
    }

    // Access control: users can only see their own packages, admins can see all
    if (req.user.role !== 'ADMIN') {
      where.createdById = req.user.id;
    }

    // Get packages with related data
    const [packages, total] = await Promise.all([
      prisma.permitPackage.findMany({
        where,
        include: {
          customer: {
            include: {
              address: true,
            },
          },
          contractor: {
            include: {
              address: true,
            },
          },
          county: true,
          siteAddress: true,
          mobileHome: true,
          subcontractors: true,
          createdBy: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
          _count: {
            select: {
              checklist: true,
              documents: true,
              subcontractors: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.permitPackage.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      items: packages,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
    });
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve packages',
    });
  }
});

// Get single package by ID
router.get('/:id', authenticateToken, canAccessPackage, async (req, res) => {
  try {
    const { id } = req.params;

    const package = await prisma.permitPackage.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            address: true,
          },
        },
        contractor: {
          include: {
            address: true,
          },
        },
        county: true,
        siteAddress: true,
        mobileHome: true,
        subcontractors: {
          include: {
            address: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        checklist: {
          orderBy: { category: 'asc' },
        },
        documents: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        logs: {
          include: {
            createdBy: {
              select: {
                id: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        signatures: {
          include: {
            signedBy: {
              select: {
                id: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!package) {
      return res.status(404).json({
        error: 'Package not found',
        message: 'Permit package does not exist',
      });
    }

    res.json(package);
  } catch (error) {
    console.error('Get package error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve package',
    });
  }
});

// Create new package
router.post('/', authenticateToken, packageValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please check your input',
        details: errors.array(),
      });
    }

    const {
      title,
      permitType,
      countyId,
      customerId,
      contractorId,
      parcelNumber,
      floodZone,
      windExposure,
      zoningApprovalRef,
      dueDate,
      siteAddress,
    } = req.body;

    // Verify that customer and contractor exist
    const [customer, contractor, county] = await Promise.all([
      prisma.customer.findUnique({ where: { id: customerId } }),
      prisma.contractor.findUnique({ where: { id: contractorId } }),
      prisma.county.findUnique({ where: { id: parseInt(countyId) } }),
    ]);

    if (!customer) {
      return res.status(400).json({
        error: 'Invalid customer',
        message: 'Customer does not exist',
      });
    }

    if (!contractor) {
      return res.status(400).json({
        error: 'Invalid contractor',
        message: 'Contractor does not exist',
      });
    }

    if (!county) {
      return res.status(400).json({
        error: 'Invalid county',
        message: 'County does not exist',
      });
    }

    // Create package with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create site address if provided
      let siteAddressId = null;
      if (siteAddress) {
        const address = await tx.address.create({
          data: siteAddress,
        });
        siteAddressId = address.id;
      }

      // Create package
      const package = await tx.permitPackage.create({
        data: {
          title,
          permitType,
          countyId: parseInt(countyId),
          customerId,
          contractorId,
          parcelNumber,
          floodZone,
          windExposure,
          zoningApprovalRef,
          dueDate: dueDate ? new Date(dueDate) : null,
          siteAddressId,
          createdById: req.user.id,
        },
        include: {
          customer: {
            include: {
              address: true,
            },
          },
          contractor: {
            include: {
              address: true,
            },
          },
          county: true,
          siteAddress: true,
          createdBy: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });

      // Create checklist items from county template
      const templateItems = await tx.countyChecklistTemplateItem.findMany({
        where: {
          countyId: parseInt(countyId),
          OR: [
            { permitType: null }, // General items
            { permitType }, // Specific permit type items
          ],
        },
        orderBy: { sort: 'asc' },
      });

      if (templateItems.length > 0) {
        await tx.packageChecklistItem.createMany({
          data: templateItems.map(item => ({
            packageId: package.id,
            label: item.label,
            category: item.category,
            required: item.required,
          })),
        });
      }

      return package;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to create package',
    });
  }
});

// Update package
router.patch('/:id', authenticateToken, canAccessPackage, packageValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please check your input',
        details: errors.array(),
      });
    }

    const { id } = req.params;
    const updateData = { ...req.body };

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.createdById;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Handle site address update
    if (updateData.siteAddress) {
      const package = await prisma.permitPackage.findUnique({
        where: { id },
        select: { siteAddressId: true },
      });

      if (package.siteAddressId) {
        // Update existing address
        await prisma.address.update({
          where: { id: package.siteAddressId },
          data: updateData.siteAddress,
        });
      } else {
        // Create new address
        const address = await prisma.address.create({
          data: updateData.siteAddress,
        });
        updateData.siteAddressId = address.id;
      }
      delete updateData.siteAddress;
    }

    // Convert countyId to integer if provided
    if (updateData.countyId) {
      updateData.countyId = parseInt(updateData.countyId);
    }

    // Convert dueDate to Date if provided
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    const updatedPackage = await prisma.permitPackage.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          include: {
            address: true,
          },
        },
        contractor: {
          include: {
            address: true,
          },
        },
        county: true,
        siteAddress: true,
        mobileHome: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.json(updatedPackage);
  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update package',
    });
  }
});

// Update package status
router.patch('/:id/status', authenticateToken, canAccessPackage, [
  body('status')
    .isIn(['DRAFT', 'IN_REVIEW', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CLOSED'])
    .withMessage('Invalid status'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Note must be less than 1000 characters'),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please check your input',
        details: errors.array(),
      });
    }

    const { id } = req.params;
    const { status, note } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // Update package status
      const updatedPackage = await tx.permitPackage.update({
        where: { id },
        data: { status },
        include: {
          customer: {
            include: {
              address: true,
            },
          },
          contractor: {
            include: {
              address: true,
            },
          },
          county: true,
          siteAddress: true,
          mobileHome: true,
          createdBy: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });

      // Create status log entry
      await tx.statusLog.create({
        data: {
          packageId: id,
          status,
          note,
          createdById: req.user.id,
        },
      });

      return updatedPackage;
    });

    res.json(result);
  } catch (error) {
    console.error('Update package status error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update package status',
    });
  }
});

// Delete package
router.delete('/:id', authenticateToken, canAccessPackage, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.permitPackage.delete({
      where: { id },
    });

    res.json({
      message: 'Package deleted successfully',
    });
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete package',
    });
  }
});

module.exports = router;
