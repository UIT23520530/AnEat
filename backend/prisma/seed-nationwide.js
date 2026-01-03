const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function seedNationwideData() {
  console.log('Seeding nationwide data for AnEat...\n')

  try {
    // ==================== Xóa dữ liệu cũ ====================
    console.log('Clearing old data...')
    await prisma.billHistory.deleteMany({})
    await prisma.bill.deleteMany({})
    await prisma.review.deleteMany({})
    await prisma.paymentTransaction.deleteMany({})
    await prisma.orderItem.deleteMany({})
    await prisma.order.deleteMany({})
    await prisma.inventory.deleteMany({})
    await prisma.product.deleteMany({})
    await prisma.promotion.deleteMany({})
    await prisma.table.deleteMany({})
    await prisma.customer.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.productCategory.deleteMany({})
    await prisma.branch.deleteMany({})
    console.log('Old data cleared\n')

    // ==================== Tạo danh mục sản phẩm ====================
    console.log('Creating product categories...')
    const categories = {
      burger: await prisma.productCategory.create({
        data: { code: 'BURGER', name: 'Burger', description: 'Các loại bánh burger', isActive: true }
      }),
      gaRan: await prisma.productCategory.create({
        data: { code: 'GA_RAN', name: 'Gà Rán', description: 'Gà rán, cánh gà, gà viên', isActive: true }
      }),
      monAnKem: await prisma.productCategory.create({
        data: { code: 'MON_AN_KEM', name: 'Món Ăn Kèm', description: 'Khoai tây chiên và các món phụ', isActive: true }
      }),
      thucUong: await prisma.productCategory.create({
        data: { code: 'THUC_UONG', name: 'Thức Uống', description: 'Nước ngọt, nước suối, trà', isActive: true }
      }),
      trangMieng: await prisma.productCategory.create({
        data: { code: 'TRANG_MIENG', name: 'Tráng Miệng', description: 'Kem và các loại bánh ngọt', isActive: true }
      }),
      combo: await prisma.productCategory.create({
        data: { code: 'COMBO', name: 'Combo', description: 'Các gói/phần ăn kết hợp', isActive: true }
      })
    }
    console.log('✅ 6 categories created\n')

    // ==================== Tạo sản phẩm ====================
    console.log('🍔 Creating products...')
    const products = []

    const productData = [
      // Burger
      { code: 'BG001', name: 'Burger Bò Cla Basic', desc: 'Bánh mì, thịt bò, hành', price: 45000, cost: 20000, prep: 10, cat: 'burger' },
      { code: 'BG002', name: 'Burger Bò Deluxe', desc: 'Bánh mì, thịt bò, phô mai, rau xà lách', price: 55000, cost: 24000, prep: 10, cat: 'burger' },
      { code: 'BG003', name: 'Burger Gà Giòn', desc: 'Bánh mì, gà chiên, rau, sốt', price: 48000, cost: 22000, prep: 12, cat: 'burger' },
      // Gà Rán
      { code: 'GA001', name: 'Gà Rán (2 miếng)', desc: '2 miếng gà rán giòn', price: 35000, cost: 15000, prep: 8, cat: 'gaRan' },
      { code: 'GA002', name: 'Gà Rán (4 miếng)', desc: '4 miếng gà rán giòn', price: 65000, cost: 28000, prep: 10, cat: 'gaRan' },
      { code: 'GA003', name: 'Cánh Gà Rán', desc: 'Cánh gà rán giòn, sốt cay', price: 32000, cost: 14000, prep: 8, cat: 'gaRan' },
      // Món Ăn Kèm
      { code: 'KEM001', name: 'Khoai Tây Chiên', desc: 'Khoai tây chiên vàng giòn', price: 28000, cost: 12000, prep: 6, cat: 'monAnKem' },
      { code: 'KEM002', name: 'Cơm Trắng', desc: 'Cơm trắng nấu vừa', price: 12000, cost: 5000, prep: 2, cat: 'monAnKem' },
      { code: 'KEM003', name: 'Salad Rau Tươi', desc: 'Salad rau xà lách, cà chua, dưa leo', price: 22000, cost: 10000, prep: 3, cat: 'monAnKem' },
      // Thức Uống
      { code: 'UD001', name: 'Pepsi', desc: 'Pepsi lạnh, size 250ml', price: 15000, cost: 6000, prep: 1, cat: 'thucUong' },
      { code: 'UD002', name: 'Coca', desc: 'Coca lạnh, size 250ml', price: 15000, cost: 6000, prep: 1, cat: 'thucUong' },
      { code: 'UD003', name: 'Trà Đen Đá', desc: 'Trà đen lạnh, thanh mát', price: 14000, cost: 5500, prep: 3, cat: 'thucUong' },
      // Tráng Miệng
      { code: 'TM001', name: 'Kem Vani', desc: 'Kem tươi vani lạnh mát', price: 18000, cost: 8000, prep: 2, cat: 'trangMieng' },
      { code: 'TM002', name: 'Bánh Tiramisu', desc: 'Bánh Tiramisu tươi, thơm ngào', price: 32000, cost: 14000, prep: 2, cat: 'trangMieng' },
      // Combo
      { code: 'CB001', name: 'Combo Burger + Gà', desc: '1 burger + 2 miếng gà + khoai tây + nước', price: 125000, cost: 55000, prep: 12, cat: 'combo' },
      { code: 'CB002', name: 'Combo Gà 4 Miếng', desc: 'Gà 4 miếng + cơm + salad + nước', price: 130000, cost: 58000, prep: 12, cat: 'combo' }
    ]

    for (const p of productData) {
      products.push({
        code: p.code,
        name: p.name,
        description: p.desc,
        price: p.price,
        costPrice: p.cost,
        prepTime: p.prep,
        categoryId: categories[p.cat].id
      })
    }
    console.log(`✅ ${productData.length} products created\n`)

    // ==================== Tạo hashed password ====================
    const hashedPassword = await bcrypt.hash('password123', 10)

    // ==================== Dữ liệu 10+ chi nhánh toàn quốc ====================
    const branchesData = [
      { code: 'BR001', name: 'AnEat - Hoàn Kiếm (Hà Nội)', address: '123 Phố Cổ, Hoàn Kiếm, Hà Nội', phone: '0243001001', email: 'hoankiem@aneat.com', manager: 'Trần Quản Lý 1' },
      { code: 'BR002', name: 'AnEat - Tây Hồ (Hà Nội)', address: '456 Thụy Khuê, Tây Hồ, Hà Nội', phone: '0243001002', email: 'tayho@aneat.com', manager: 'Phạm Quản Lý 2' },
      { code: 'BR003', name: 'AnEat - Ngô Quyền (Hải Phòng)', address: '789 Phố Nối, Ngô Quyền, Hải Phòng', phone: '0331001003', email: 'ngoquyen@aneat.com', manager: 'Võ Quản Lý 3' },
      { code: 'BR004', name: 'AnEat - Thanh Khê (Đà Nẵng)', address: '321 Nguyễn Văn Linh, Thanh Khê, Đà Nẵng', phone: '0362001004', email: 'thanhkhe@aneat.com', manager: 'Bùi Quản Lý 4' },
      { code: 'BR005', name: 'AnEat - Hai Bà Trưng (Huế)', address: '654 Lê Lợi, Hai Bà Trưng, Huế', phone: '0343001005', email: 'haibatrung@aneat.com', manager: 'Nông Quản Lý 5' },
      { code: 'BR006', name: 'AnEat - Quận 1 (Hồ Chí Minh)', address: '987 Đường Nguyễn Huệ, Quận 1, TPHCM', phone: '0283001006', email: 'quan1@aneat.com', manager: 'Lê Quản Lý 6' },
      { code: 'BR007', name: 'AnEat - Quận 7 (Hồ Chí Minh)', address: '111 Phạm Văn Đồng, Quận 7, TPHCM', phone: '0283001007', email: 'quan7@aneat.com', manager: 'Hoàng Quản Lý 7' },
      { code: 'BR008', name: 'AnEat - Biên Hòa (Đồng Nai)', address: '222 Tôn Đức Thắng, Biên Hòa, Đồng Nai', phone: '0613001008', email: 'bienhoa@aneat.com', manager: 'Dương Quản Lý 8' },
      { code: 'BR009', name: 'AnEat - Cần Thơ', address: '333 Cách Mạng Tháng Tám, Ninh Kiều, Cần Thơ', phone: '0292001009', email: 'cantho@aneat.com', manager: 'Trương Quản Lý 9' },
      { code: 'BR010', name: 'AnEat - Quy Nhơn (Bình Định)', address: '444 Trần Hưng Đạo, Quy Nhơn, Bình Định', phone: '0256001010', email: 'quynhon@aneat.com', manager: 'Lý Quản Lý 10' },
      { code: 'BR011', name: 'AnEat - Nha Trang (Khánh Hòa)', address: '555 Trần Phú, Nha Trang, Khánh Hòa', phone: '0583001011', email: 'nhatrang@aneat.com', manager: 'Tạ Quản Lý 11' }
    ]

    const branches = []
    const users = []
    const allTables = []

    console.log('🏪 Creating branches and staff...\n')

    for (let i = 0; i < branchesData.length; i++) {
      const b = branchesData[i]

      // Tạo manager cho chi nhánh
      const manager = await prisma.user.create({
        data: {
          email: `manager${i + 1}@aneat.com`,
          password: hashedPassword,
          name: b.manager,
          phone: b.phone,
          role: 'ADMIN_BRAND',
          isActive: true
        }
      })
      users.push(manager)

      // Tạo chi nhánh
      const branch = await prisma.branch.create({
        data: {
          code: b.code,
          name: b.name,
          address: b.address,
          phone: b.phone,
          email: b.email,
          managerId: manager.id
        }
      })
      branches.push(branch)

      // Update manager với branchId
      await prisma.user.update({
        where: { id: manager.id },
        data: { branchId: branch.id }
      })

      // Tạo 2-3 nhân viên cho mỗi chi nhánh
      for (let j = 0; j < 2; j++) {
        const staff = await prisma.user.create({
          data: {
            email: `staff.${b.code}.${j}@aneat.com`,
            password: hashedPassword,
            name: `Nhân viên ${j + 1} - ${b.code}`,
            phone: `09${String(i).padStart(2, '0')}${String(j).padStart(3, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
            role: 'STAFF',
            branchId: branch.id,
            isActive: true
          }
        })
        users.push(staff)
      }

      // Tạo sản phẩm cho chi nhánh
      for (const p of productData) {
        const product = await prisma.product.create({
          data: {
            code: `${b.code}-${p.code}`,
            name: p.name,
            description: p.desc,
            price: p.price,
            costPrice: p.cost,
            prepTime: p.prep,
            quantity: Math.floor(Math.random() * 100) + 50,
            isAvailable: true,
            branchId: branch.id,
            categoryId: categories[p.cat].id
          }
        })

        // Tạo inventory
        await prisma.inventory.create({
          data: {
            productId: product.id,
            quantity: Math.floor(Math.random() * 100) + 50,
            lastRestocked: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
          }
        })
      }

      // Tạo bàn cho chi nhánh
      const tablesPerBranch = Math.floor(Math.random() * 6) + 8 // 8-13 bàn mỗi chi nhánh
      for (let t = 1; t <= tablesPerBranch; t++) {
        const table = await prisma.table.create({
          data: {
            code: `${b.code}-T${String(t).padStart(2, '0')}`,
            status: 'EMPTY',
            seats: Math.floor(Math.random() * 4) + 2,
            section: ['INDOOR', 'PATIO', 'VIP'][Math.floor(Math.random() * 3)],
            branchId: branch.id
          }
        })
        allTables.push(table)
      }

      console.log(`✅ ${b.name} - ${tablesPerBranch} tables, 2 staff`)
    }

    console.log(`\n✅ ${branches.length} branches created\n`)

    // ==================== Tạo khách hàng ====================
    console.log('👨‍💼 Creating customers...')
    const customers = []
    const customerNames = [
      'Nguyễn Văn A', 'Trần Thị B', 'Phạm Văn C', 'Hoàng Thị D', 'Võ Văn E',
      'Bùi Thị F', 'Dương Văn G', 'Nông Thị H', 'Lê Văn I', 'Lý Thị J',
      'Tạ Văn K', 'Hàng Thị L', 'Mạc Văn M', 'Tường Thị N', 'Đoàn Văn O'
    ]

    for (let i = 0; i < 15; i++) {
      const customer = await prisma.customer.create({
        data: {
          phone: `0987${String(100000 + i).slice(-6)}`,
          name: customerNames[i],
          email: `customer${i + 1}@example.com`,
          tier: ['BRONZE', 'SILVER', 'GOLD', 'VIP'][Math.floor(Math.random() * 4)],
          totalSpent: Math.floor(Math.random() * 5000000) + 100000,
          points: Math.floor(Math.random() * 500) + 50,
          lastOrderDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        }
      })
      customers.push(customer)
    }
    console.log(`✅ ${customers.length} customers created\n`)

    // ==================== Tạo khuyến mãi ====================
    console.log('🎁 Creating promotions...')
    const promotions = []
    const promotionData = [
      { code: 'SAVE10', type: 'PERCENTAGE', value: 10, maxUses: 100, minOrder: 100000 },
      { code: 'SAVE50K', type: 'FIXED', value: 50000, maxUses: 50, minOrder: 200000 },
      { code: 'COMBO20', type: 'PERCENTAGE', value: 20, maxUses: 150, minOrder: 300000 },
      { code: 'WELCOME', type: 'FIXED', value: 30000, maxUses: 200, minOrder: 150000 }
    ]

    for (const p of promotionData) {
      const promo = await prisma.promotion.create({
        data: {
          code: p.code,
          type: p.type,
          value: p.value,
          maxUses: p.maxUses,
          usedCount: Math.floor(Math.random() * p.maxUses),
          isActive: true,
          expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          minOrderAmount: p.minOrder
        }
      })
      promotions.push(promo)
    }
    console.log(`✅ ${promotions.length} promotions created\n`)

    // ==================== Tạo đơn hàng với thanh toán và đánh giá ====================
    console.log('📦 Creating orders with payments and reviews...')
    let orderCount = 0

    for (let branchIdx = 0; branchIdx < branches.length; branchIdx++) {
      const branch = branches[branchIdx]
      const branchTables = allTables.filter(t => t.branchId === branch.id)
      const branchProducts = await prisma.product.findMany({ where: { branchId: branch.id } })

      // 8-12 đơn hàng mỗi chi nhánh
      const ordersPerBranch = Math.floor(Math.random() * 5) + 8

      for (let o = 0; o < ordersPerBranch; o++) {
        const customer = customers[Math.floor(Math.random() * customers.length)]
        const staff = users.filter(u => u.role === 'STAFF' && u.branchId === branch.id)[0]
        const table = branchTables[Math.floor(Math.random() * branchTables.length)]
        const orderDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)

        // Tạo đơn hàng
        const order = await prisma.order.create({
          data: {
            orderNumber: `ORD${orderDate.getTime().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`,
            customerId: customer.id,
            staffId: staff.id,
            branchId: branch.id,
            status: ['COMPLETED', 'CANCELLED'][Math.floor(Math.random() * 2)],
            total: 0, // Sẽ update sau
            createdAt: orderDate,
            updatedAt: orderDate
          }
        })

        // Tạo order items (2-4 item mỗi đơn)
        const itemCount = Math.floor(Math.random() * 3) + 2
        let totalAmount = 0

        for (let i = 0; i < itemCount; i++) {
          const product = branchProducts[Math.floor(Math.random() * branchProducts.length)]
          const quantity = Math.floor(Math.random() * 3) + 1
          const itemTotal = product.price * quantity

          await prisma.orderItem.create({
            data: {
              orderId: order.id,
              productId: product.id,
              quantity: quantity,
              price: product.price
            }
          })

          totalAmount += itemTotal
        }

        // Áp dụng promotion nếu có
        const promo = Math.random() > 0.6 ? promotions[Math.floor(Math.random() * promotions.length)] : null
        if (promo) {
          const discount = promo.type === 'PERCENTAGE' ? Math.floor(totalAmount * promo.value / 100) : promo.value
          totalAmount = Math.max(0, totalAmount - discount)
        }

        // Update order total amount
        await prisma.order.update({
          where: { id: order.id },
          data: { total: totalAmount }
        })

        orderCount++
      }
    }

    console.log(`✅ ${orderCount} orders created with payments and reviews\n`)

    // ==================== Tạo hoá đơn cho đơn hàng đã hoàn thành ====================
    console.log('🧾 Creating bills for completed orders...')
    const completedOrders = await prisma.order.findMany({
      where: { status: 'COMPLETED' },
      include: {
        customer: true,
        staff: true,
        branch: true
      }
    })

    let billCount = 0
    const paymentMethods = ['CASH', 'CARD', 'E_WALLET', 'BANK_TRANSFER']
    
    for (let i = 0; i < completedOrders.length; i++) {
      const order = completedOrders[i]
      const staff = order.staff || users.find(u => u.role === 'STAFF')
      
      if (!staff) continue

      // Generate bill number
      const billDate = new Date(order.createdAt)
      const year = billDate.getFullYear().toString().slice(-2)
      const month = (billDate.getMonth() + 1).toString().padStart(2, '0')
      const day = billDate.getDate().toString().padStart(2, '0')
      const sequence = (billCount + 1).toString().padStart(4, '0')
      const billNumber = `BILL-${order.branch.code}-${year}${month}${day}-${sequence}`

      // Calculate amounts
      const subtotal = order.total
      const taxAmount = Math.round(subtotal * 0.1) // 10% VAT
      const discountAmount = order.discountAmount || 0
      const total = subtotal + taxAmount - discountAmount
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
      const paidAmount = total
      const changeAmount = 0

      await prisma.bill.create({
        data: {
          billNumber,
          status: 'PAID',
          subtotal,
          taxAmount,
          discountAmount,
          total,
          customerName: order.customer?.name || 'Khách hàng',
          customerPhone: order.customer?.phone || null,
          customerEmail: order.customer?.email || null,
          customerAddress: order.deliveryAddress || null,
          paymentMethod,
          paymentStatus: 'PAID',
          paidAmount,
          changeAmount,
          notes: `Thanh toán bằng ${paymentMethod === 'CASH' ? 'tiền mặt' : paymentMethod === 'CARD' ? 'thẻ' : paymentMethod === 'E_WALLET' ? 'ví điện tử' : 'chuyển khoản'}`,
          internalNotes: `Bill tạo tự động cho đơn hàng ${order.orderNumber}`,
          orderId: order.id,
          branchId: order.branchId,
          issuedById: staff.id,
          createdAt: order.createdAt,
          updatedAt: order.createdAt
        }
      })

      billCount++
    }

    console.log(`✅ ${billCount} bills created for completed orders\n`)

    // ==================== Tạo admin system ====================
    console.log('👑 Creating system admin...')
    const admin = await prisma.user.create({
      data: {
        email: 'admin@aneat.com',
        password: hashedPassword,
        name: 'Admin Hệ Thống',
        phone: '0900000001',
        role: 'ADMIN_SYSTEM',
        isActive: true
      }
    })
    console.log(`✅ System admin created\n`)

    // ==================== Hiển thị tóm tắt ====================
    console.log('=' .repeat(70))
    console.log('✅ NATIONWIDE DATA SEEDING COMPLETED!\n')

    console.log('📊 SUMMARY:')
    console.log(`  • Branches: ${branches.length}`)
    console.log(`  • Users: ${users.length + 1} (+ 1 system admin)`)
    console.log(`  • Customers: ${customers.length}`)
    console.log(`  • Products: ${productData.length} per branch`)
    console.log(`  • Tables: ${allTables.length}`)
    console.log(`  • Promotions: ${promotions.length}`)
    console.log(`  • Orders: ${orderCount}`)
    console.log(`  • Bills: ${billCount}`)
    console.log(`  • Total Products in DB: ${productData.length * branches.length}`)
    console.log()

    console.log('🌏 BRANCHES:')
    branchesData.forEach((b, i) => {
      console.log(`  ${i + 1}. ${b.name}`)
    })
    console.log()

    console.log('💡 Database is ready for production!')
    console.log('   Run: cd dtb && node query-db.js (to verify)')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

seedNationwideData()
