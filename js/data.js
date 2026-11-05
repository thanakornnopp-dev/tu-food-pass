/**
 * TU Food Pass - Database of Thammasat University (Rangsit Campus)
 * Embedded Offline Data for TU109 Entrepreneurship Project
 */

window.TUData = {
  locations: [
    { id: 'ALL', name: 'ทุกโรงอาหาร (All Locations)', shortName: 'ทั้งหมด', icon: '📍' },
    { id: 'SC', name: 'ศูนย์อาหารสังคมศาสตร์ (SC Canteen)', shortName: 'SC', icon: '🏛️' },
    { id: 'EN', name: 'ศูนย์อาหารวิศวกรรมศาสตร์ (EN Canteen)', shortName: 'วิศวะ (EN)', icon: '⚙️' },
    { id: 'SCI', name: 'ศูนย์อาหารวิทยาศาสตร์ (SCI Canteen)', shortName: 'วิทย์ (SCI)', icon: '🔬' },
    { id: 'TS', name: 'ศูนย์อาหารทิวสน (TS Canteen)', shortName: 'ทิวสน', icon: '🌲' },
    { id: 'HOW', name: 'ห้องอาหาร HOW Cafeteria (Green Canteen)', shortName: 'HOW Canteen', icon: '🥗' },
    { id: 'OLB', name: 'ห้องอาหารอิ่มสุข (OLB)', shortName: 'อิ่มสุข', icon: '🍲' },
    { id: 'INTERZONE', name: 'ศูนย์อาหารอินเตอร์โซน (Interzone)', shortName: 'Interzone', icon: '🏟️' },
    { id: 'GYM', name: 'ศูนย์อาหารยิมเนเซียม 4, 6, 7', shortName: 'ยิม 4/6/7', icon: '🏸' },
    { id: 'CHIENGRAK', name: 'โซนประตูเชียงราก & U-Square', shortName: 'เชียงราก/U-Square', icon: '🛍️' }
  ],

  foodTypes: [
    { id: 'ALL', name: 'ทุกประเภทอาหาร (All Types)', icon: '🍽️' },
    { id: 'A_LA_CARTE', name: 'อาหารตามสั่ง', icon: '🍳' },
    { id: 'NOODLE', name: 'ก๋วยเตี๋ยว / ราเมน', icon: '🍜' },
    { id: 'RICE_CURRY', name: 'ข้าวแกง / จานด่วน', icon: '🍛' },
    { id: 'JAPAN_INTER', name: 'ญี่ปุ่น / อินเตอร์', icon: '🍱' },
    { id: 'HEALTHY_HALAL', name: 'อาหารคลีน / ฮาลาล', icon: '🥗' },
    { id: 'DRINK_CAFE', name: 'เครื่องดื่ม / ชา-กาแฟ', icon: '🧋' },
    { id: 'DESSERT_SNACK', name: 'ของหวาน / ทานเล่น', icon: '🍰' }
  ],

  // วันและสีเสื้อมงคลประจำวัน สำหรับฟีเจอร์ "สุ่มสายมู"
  muteluDays: [
    {
      dayIndex: 0,
      dayName: 'วันอาทิตย์ (Sunday)',
      luckyColor: 'สีเขียวเหนี่ยวทรัพย์ / สีแดงเสริมอำนาจ',
      colorHex: '#15803d',
      luckyFoodTheme: 'เมนูผักใบเขียวสดชื่น, ข้าวผัดคะน้าหมูกรอบ, น้ำกีวี่ปั่น, ต้มยำกุ้งสีชาด',
      blessing: 'เสริมความมั่นใจ การตัดสินใจเด็ดขาด และความมั่งคั่ง'
    },
    {
      dayIndex: 1,
      dayName: 'วันจันทร์ (Monday)',
      luckyColor: 'สีม่วงดึงดูดโชคลาภ / สีส้มเสริมผู้ใหญ่เอ็นดู',
      colorHex: '#7e22ce',
      luckyFoodTheme: 'เมนูกะหล่ำปลีม่วง, ชาไทยเข้มข้นสีส้ม, ข้าวหน้าปลาแซลมอน, บิงซูเผือกหอม',
      blessing: 'เสริมเสน่ห์ มีคนช่วยเหลือ เมตตามหานิยม งานราบรื่น'
    },
    {
      dayIndex: 2,
      dayName: 'วันอังคาร (Tuesday)',
      luckyColor: 'สีส้มสว่าง / สีทองรับทรัพย์',
      colorHex: '#c2410c',
      luckyFoodTheme: 'ข้าวหมูกรอบคั่วพริกเกลือสีทอง, แกงส้มชะอมกุ้ง, ชาไทยไข่มุกสีทอง, น้ำส้มคั้นสด',
      blessing: 'เสริมไฟในการอ่านหนังสือ โค้งสุดท้ายก่อนสอบผ่านฉลุย'
    },
    {
      dayIndex: 3,
      dayName: 'วันพุธ (Wednesday)',
      luckyColor: 'สีดำ / สีเทาควันบุหรี่ / สีฟ้าเสริมสติปัญญา',
      colorHex: '#0284c7',
      luckyFoodTheme: 'ข้าวซอยไก่, สปาเกตตีหมึกดำ, ปลากะพงนึ่งซีอิ๊ว, ชานมชาโคลไข่มุก',
      blessing: 'เสริมสมาธิ ความคิดสร้างสรรค์ การเจรจาโปรเจกต์ผ่านง่าย'
    },
    {
      dayIndex: 4,
      dayName: 'วันพฤหัสบดี (Thursday)',
      luckyColor: 'สีแดงแรงฤทธิ์ / สีส้มเสริมคะแนนสอบ',
      colorHex: '#b91c1c',
      luckyFoodTheme: 'ต้มยำกุ้งน้ำข้นสีชาด, ข้าวหมูแดงอบน้ำผึ้ง, ชาไทยการันตีรสเข้ม, สตรอว์เบอร์รีสมูทตี้',
      blessing: 'ครูบาอาจารย์เมตตา พรีเซนต์ราบรื่น คะแนนสอบพุ่งทะลุเป้า'
    },
    {
      dayIndex: 5,
      dayName: 'วันศุกร์ (Friday)',
      luckyColor: 'สีชมพูเปิดทางรัก / สีเขียวเสริมเงินทอง',
      colorHex: '#db2777',
      luckyFoodTheme: 'เย็นตาโฟต้มยำน้ำชมพู, สลัดอโวคาโด, ข้าวคลุกกะปิเครื่องแน่น, นมชมพูปั่น',
      blessing: 'ดึงดูดพลังบวก ความสุข สุขภาพกายใจเบิกบานรับวันหยุด'
    },
    {
      dayIndex: 6,
      dayName: 'วันเสาร์ (Saturday)',
      luckyColor: 'สีน้ำเงิน / สีฟ้าครามเสริมความราบรื่น',
      colorHex: '#1d4ed8',
      luckyFoodTheme: 'ข้าวยำปักษ์ใต้ดอกอัญชัน, ข้าวราดแกงกะหรี่ญี่ปุ่น, นมอัญชันคาราเมล, น้ำบลูฮาวาย',
      blessing: 'ล้างพลังงานลบ ไร้อุปสรรค ได้พักผ่อนและเติมพลังชีวิต'
    }
  ],

  // ฐานข้อมูลร้านอาหารรอบ มธ. รังสิต (18 ร้าน ข้อมูลตัวอย่างเพื่อการเรียน (demo data))
  stalls: [
    {
      id: 'SC-01',
      name: 'ป้าศรี อาหารตามสั่งเตาไฟลุก',
      location: 'SC',
      foodType: 'A_LA_CARTE',
      rating: 4.8,
      reviewsCount: 342,
      openTime: 7,
      closeTime: 18,
      avgPrice: 55,
      priceRange: '45 - 70 ฿',
      recommendedMenu: 'กะเพราหมูกรอบไข่ดาวเยิ้ม',
      calories: 620,
      tags: ['เผ็ดจัดจ้าน', 'ยอดฮิต', 'ให้เยอะ'],
      dietary: ['NON_HALAL'],
      isSecretDeal: false,
      couponDeal: {
        title: 'ลดทันที 10% ทุกเมนูกะเพรา',
        discountText: '10% OFF',
        code: 'PASRI10',
        minSpend: 50,
        validHours: 4
      }
    },
    {
      id: 'SC-02',
      name: 'ก๋วยเตี๋ยวเรืออยุธยา โกฮับ รสเด็ด',
      location: 'SC',
      foodType: 'NOODLE',
      rating: 4.7,
      reviewsCount: 289,
      openTime: 8,
      closeTime: 17,
      avgPrice: 45,
      priceRange: '35 - 60 ฿',
      recommendedMenu: 'เส้นเล็กน้ำตกหมูตุ๋นพิเศษแคบหมู',
      calories: 450,
      tags: ['น้ำซุปเข้มข้น', 'แคบหมูกรอบ', 'เร็วทันใจ'],
      dietary: ['NON_HALAL'],
      isSecretDeal: false,
      couponDeal: {
        title: 'ฟรีแคบหมูกรอบ 1 ถุง เมื่อสั่งพิเศษ',
        discountText: 'FREE TOPPING',
        code: 'GOHUBFREE',
        minSpend: 45,
        validHours: 3
      }
    },
    {
      id: 'SC-03',
      name: 'ชื่นใจ ชาไทยการันตี & น้ำปั่น',
      location: 'SC',
      foodType: 'DRINK_CAFE',
      rating: 4.9,
      reviewsCount: 512,
      openTime: 7,
      closeTime: 19,
      avgPrice: 35,
      priceRange: '25 - 50 ฿',
      recommendedMenu: 'ชาไทยส้มเข้มข้น หวานน้อย 50%',
      calories: 220,
      tags: ['หวานน้อยได้', 'ชื่นใจ', 'สายมูสีส้ม'],
      dietary: ['VEGETARIAN', 'HALAL'],
      isSecretDeal: true,
      couponDeal: {
        title: 'ซื้อแก้วใหญ่ ลด 15 บาท (Eater Pass Exclusive)',
        discountText: '15฿ OFF',
        code: 'CHUENJAI15',
        minSpend: 35,
        validHours: 2
      }
    },
    {
      id: 'EN-01',
      name: 'สเต็กเกียร์ วิศวะกระทะร้อน',
      location: 'EN',
      foodType: 'A_LA_CARTE',
      rating: 4.8,
      reviewsCount: 420,
      openTime: 10,
      closeTime: 19,
      avgPrice: 89,
      priceRange: '69 - 139 ฿',
      recommendedMenu: 'สเต็กไก่สไปซี่จับคู่เฟรนช์ฟรายส์จัมโบ้',
      calories: 680,
      tags: ['อิ่มจุก', 'โปรตีนแน่น', 'เด็กวิศวะถูกใจ'],
      dietary: ['NON_HALAL'],
      isSecretDeal: false,
      couponDeal: {
        title: 'แถมฟรีชีสดิป หรือโค้ก 1 กระป๋อง',
        discountText: 'FREE CHEESE',
        code: 'ENGEARFREE',
        minSpend: 79,
        validHours: 4
      }
    },
    {
      id: 'EN-02',
      name: 'ป้าสมใจ ข้าวราดแกง 100 หม้อ',
      location: 'EN',
      foodType: 'RICE_CURRY',
      rating: 4.6,
      reviewsCount: 198,
      openTime: 6,
      closeTime: 15,
      avgPrice: 45,
      priceRange: '35 - 55 ฿',
      recommendedMenu: 'ข้าวราดพะแนงหมู + ไข่ต้มยางมะตูม',
      calories: 520,
      tags: ['เร็วมาก', 'ประหยัดสุด', 'เติมน้ำซุปฟรี'],
      dietary: ['NON_HALAL'],
      isSecretDeal: false,
      couponDeal: {
        title: 'ลด 5 บาท เมื่อสั่งกับข้าว 2 อย่างขึ้นไป',
        discountText: '5฿ OFF',
        code: 'PRAJUMP5',
        minSpend: 40,
        validHours: 3
      }
    },
    {
      id: 'EN-03',
      name: 'วิศวกาแฟ (Engineering Drip & Cold Brew)',
      location: 'EN',
      foodType: 'DRINK_CAFE',
      rating: 4.9,
      reviewsCount: 310,
      openTime: 7,
      closeTime: 17,
      avgPrice: 50,
      priceRange: '40 - 75 ฿',
      recommendedMenu: 'Americano เมล็ดคั่วกลางเชียงราย',
      calories: 15,
      tags: ['ตื่นเต็มตา', 'แคลอรี่ต่ำ', 'สายอ่านหนังสือ'],
      dietary: ['VEGETARIAN', 'HALAL'],
      isSecretDeal: true,
      couponDeal: {
        title: 'อัปไซส์เป็นแก้ว 22 ออนซ์ฟรี',
        discountText: 'FREE UPGRADE',
        code: 'ENGDRIPUP',
        minSpend: 45,
        validHours: 3
      }
    },
    {
      id: 'SCI-01',
      name: 'ราเมนสูตรลับแล็บฟิสิกส์ (Physics Ramen)',
      location: 'SCI',
      foodType: 'JAPAN_INTER',
      rating: 4.7,
      reviewsCount: 245,
      openTime: 10,
      closeTime: 18,
      avgPrice: 79,
      priceRange: '65 - 110 ฿',
      recommendedMenu: 'ทงคตสึราเมนหมูชาชูน้ำซุปเคี่ยวนาน 12 ชม.',
      calories: 610,
      tags: ['ซุปกลมกล่อม', 'เส้นสดเหนียวนุ่ม', 'แอร์เย็น'],
      dietary: ['NON_HALAL'],
      isSecretDeal: false,
      couponDeal: {
        title: 'ลดทันที 15 บาท ทุกชามราเมน',
        discountText: '15฿ OFF',
        code: 'SCIRAMEN15',
        minSpend: 70,
        validHours: 4
      }
    },
    {
      id: 'SCI-02',
      name: 'ครัวคุณยาย ข้าวมันไก่ตอน',
      location: 'SCI',
      foodType: 'RICE_CURRY',
      rating: 4.6,
      reviewsCount: 180,
      openTime: 7,
      closeTime: 16,
      avgPrice: 50,
      priceRange: '45 - 65 ฿',
      recommendedMenu: 'ข้าวมันไก่ผสม (ต้ม+ทอด) น้ำจิ้มเต้าเจี้ยวสูตรเด็ด',
      calories: 590,
      tags: ['ไก่นุ่มฉ่ำ', 'น้ำซุปฟักหวาน', 'ราคาเป็นมิตร'],
      dietary: ['NON_HALAL'],
      isSecretDeal: false,
      couponDeal: {
        title: 'สั่งข้าวมันไก่พิเศษ แถมฟรีน้ำเก๊กฮวย 1 แก้ว',
        discountText: 'FREE DRINK',
        code: 'KHAOMANFREE',
        minSpend: 55,
        validHours: 3
      }
    },
    {
      id: 'TS-01',
      name: 'ข้าวยำไก่แซ่บ & ไก่กรอบทิวสน',
      location: 'TS',
      foodType: 'A_LA_CARTE',
      rating: 4.8,
      reviewsCount: 380,
      openTime: 8,
      closeTime: 19,
      avgPrice: 50,
      priceRange: '45 - 65 ฿',
      recommendedMenu: 'ข้าวยำไก่แซ่บพริกคั่วข้าวคั่วหอมกรุ่น',
      calories: 540,
      tags: ['แซ่บถึงใจ', 'ข้าวสวยนุ่ม', 'บริการไว'],
      dietary: ['HALAL_FRIENDLY'],
      isSecretDeal: false,
      couponDeal: {
        title: 'ลด 10% สำหรับสมาชิก Eater Pass',
        discountText: '10% OFF',
        code: 'TSYUM10',
        minSpend: 50,
        validHours: 4
      }
    },
    {
      id: 'TS-02',
      name: 'ปังปิ้งเนยเยิ้ม & ชานมใต้ทิวสน',
      location: 'TS',
      foodType: 'DESSERT_SNACK',
      rating: 4.7,
      reviewsCount: 220,
      openTime: 9,
      closeTime: 20,
      avgPrice: 35,
      priceRange: '20 - 55 ฿',
      recommendedMenu: 'ขนมปังเนยโพลคาดอท + ชาชักปักษ์ใต้',
      calories: 340,
      tags: ['หวานมัน', 'ของหวานหลังเลิกเรียน', 'กลิ่นเนยหอม'],
      dietary: ['VEGETARIAN', 'HALAL'],
      isSecretDeal: false,
      couponDeal: {
        title: 'ซื้อปังปิ้ง 2 แผ่น ฟรีท็อปปิ้งฝอยทอง',
        discountText: 'FREE TOPPING',
        code: 'TOASTFOY',
        minSpend: 40,
        validHours: 3
      }
    },
    {
      id: 'HOW-01',
      name: 'Green Healthy Salad & Poke Bowl',
      location: 'HOW',
      foodType: 'HEALTHY_HALAL',
      rating: 4.9,
      reviewsCount: 310,
      openTime: 8,
      closeTime: 18,
      avgPrice: 85,
      priceRange: '65 - 120 ฿',
      recommendedMenu: 'Poke Bowl ทูน่าสไปซี่ & อโวคาโดคลีน',
      calories: 380,
      tags: ['คลีนเพื่อสุขภาพ', 'โปรตีนสูง', 'ไขมันดี'],
      dietary: ['CLEAN_FOOD', 'HALAL', 'VEGETARIAN_OPTION'],
      isSecretDeal: true,
      couponDeal: {
        title: 'ลด 20 บาท สำหรับเมนู Poke Bowl คลีน',
        discountText: '20฿ OFF',
        code: 'POKEGREEN20',
        minSpend: 80,
        validHours: 4
      }
    },
    {
      id: 'HOW-02',
      name: 'ครัวมุสลิมฮาลาลแท้ 100% บังมีน',
      location: 'HOW',
      foodType: 'HEALTHY_HALAL',
      rating: 4.8,
      reviewsCount: 275,
      openTime: 7,
      closeTime: 18,
      avgPrice: 60,
      priceRange: '50 - 80 ฿',
      recommendedMenu: 'ข้าวหมกไก่ทอดหอมเจียว + ซุปเนื้อเปื่อยรสแซ่บ',
      calories: 580,
      tags: ['ฮาลาลแท้', 'ข้าวหมกหอมเครื่องเทศ', 'ซุปร้อนโล่งคอ'],
      dietary: ['HALAL'],
      isSecretDeal: false,
      couponDeal: {
        title: 'ลด 10% ทุกเมนูข้าวหมก',
        discountText: '10% OFF',
        code: 'HALALMOK10',
        minSpend: 55,
        validHours: 4
      }
    },
    {
      id: 'OLB-01',
      name: 'ข้าวขาหมูอิ่มสุข หนังนุ่มละลาย',
      location: 'OLB',
      foodType: 'RICE_CURRY',
      rating: 4.7,
      reviewsCount: 230,
      openTime: 7,
      closeTime: 15,
      avgPrice: 55,
      priceRange: '45 - 75 ฿',
      recommendedMenu: 'ข้าวขาหมูเนื้อหนังไส้ + ไข่พะโล้',
      calories: 650,
      tags: ['นุ่มละลาย', 'น้ำราดเข้มข้น', 'ผักกาดดองตัดเลี่ยน'],
      dietary: ['NON_HALAL'],
      isSecretDeal: false,
      couponDeal: {
        title: 'แถมฟรีไข่พะโล้ 1 ฟอง เมื่อสั่งจานพิเศษ',
        discountText: 'FREE EGG',
        code: 'OLBEGG55',
        minSpend: 55,
        validHours: 3
      }
    },
    {
      id: 'INTERZONE-01',
      name: 'K-Street Tteokbokki & ไก่ทอดเกาหลี',
      location: 'INTERZONE',
      foodType: 'JAPAN_INTER',
      rating: 4.8,
      reviewsCount: 460,
      openTime: 11,
      closeTime: 21,
      avgPrice: 89,
      priceRange: '69 - 149 ฿',
      recommendedMenu: 'เซตไก่ทอดซอสการ์ลิค + ต็อกบกกีชีสยืด',
      calories: 720,
      tags: ['ชีสยืดสะใจ', 'เกาหลีแท้', 'นั่งชิลตอนเย็น'],
      dietary: ['NON_HALAL'],
      isSecretDeal: true,
      couponDeal: {
        title: 'ลด 15% บิลเกิน 100 บาท (Eater Pass Exclusive)',
        discountText: '15% OFF',
        code: 'KSTREET15',
        minSpend: 100,
        validHours: 4
      }
    },
    {
      id: 'INTERZONE-02',
      name: 'ส้มตำแซ่บนัว ยายเพ็ญ อินเตอร์โซน',
      location: 'INTERZONE',
      foodType: 'A_LA_CARTE',
      rating: 4.8,
      reviewsCount: 390,
      openTime: 10,
      closeTime: 20,
      avgPrice: 65,
      priceRange: '45 - 90 ฿',
      recommendedMenu: 'ส้มตำคอหมูย่าง + ข้าวเหนียวอัญชัน',
      calories: 460,
      tags: ['ปลาร้าต้มสุก', 'แซ่บลืมง่วง', 'คอหมูย่างฉ่ำ'],
      dietary: ['NON_HALAL'],
      isSecretDeal: false,
      couponDeal: {
        title: 'สั่งส้มตำ 2 ครก แถมข้าวเหนียว 2 ห่อฟรี',
        discountText: 'FREE RICE',
        code: 'ZAPNUA2FREE',
        minSpend: 80,
        validHours: 3
      }
    },
    {
      id: 'GYM-01',
      name: 'Fit & Lean อกไก่คลีน & สมูทตี้เวย์โปรตีน',
      location: 'GYM',
      foodType: 'HEALTHY_HALAL',
      rating: 4.9,
      reviewsCount: 260,
      openTime: 9,
      closeTime: 21,
      avgPrice: 75,
      priceRange: '60 - 110 ฿',
      recommendedMenu: 'ข้าวกล้องอกไก่ย่างพริกไทยดำ + น้ำจิ้มแจ่วคลีน',
      calories: 360,
      tags: ['ฟิตเนส', 'ลีนไขมัน', 'โปรตีน 42g'],
      dietary: ['CLEAN_FOOD', 'HALAL'],
      isSecretDeal: false,
      couponDeal: {
        title: 'เพิ่มเวย์โปรตีน 1 สกู๊ปฟรี ในเครื่องดื่มสมูทตี้',
        discountText: 'FREE WHEY',
        code: 'FITWHEYFREE',
        minSpend: 65,
        validHours: 4
      }
    },
    {
      id: 'CHIENGRAK-01',
      name: 'หมูกระทะบุฟเฟต์ฟิน & ปิ้งย่าง U-Square',
      location: 'CHIENGRAK',
      foodType: 'A_LA_CARTE',
      rating: 4.9,
      reviewsCount: 680,
      openTime: 16,
      closeTime: 24,
      avgPrice: 199,
      priceRange: '179 - 259 ฿',
      recommendedMenu: 'บุฟเฟต์หมูหมักนุ่ม + กุ้งสดไม่อั้น',
      calories: 950,
      tags: ['ปาร์ตี้กับเพื่อน', 'รอบดึก', 'น้ำจิ้มมะนาวแท้'],
      dietary: ['NON_HALAL'],
      isSecretDeal: true,
      couponDeal: {
        title: 'มา 4 คน จ่าย 3 คน หรือลด 50 บาทต่อโต๊ะ',
        discountText: '50฿ OFF',
        code: 'MUKRATA50',
        minSpend: 350,
        validHours: 6
      }
    },
    {
      id: 'CHIENGRAK-02',
      name: 'บะหมี่เกี๊ยวยักษ์หมูแดงอบน้ำผึ้ง ประตูเชียงราก 2',
      location: 'CHIENGRAK',
      foodType: 'NOODLE',
      rating: 4.7,
      reviewsCount: 340,
      openTime: 15,
      closeTime: 23,
      avgPrice: 55,
      priceRange: '50 - 75 ฿',
      recommendedMenu: 'บะหมี่ไข่เส้นแบนเกี๊ยวกุ้งหมูแดงกรอบ',
      calories: 490,
      tags: ['เกี๊ยวแน่นเต็มคำ', 'หมูแดงฉ่ำน้ำผึ้ง', 'เปิดถึงเที่ยงคืน'],
      dietary: ['NON_HALAL'],
      isSecretDeal: false,
      couponDeal: {
        title: 'แถมเกี๊ยวทอดกรอบ 3 ชิ้นฟรี',
        discountText: 'FREE WONTON',
        code: 'GEAWFREE3',
        minSpend: 50,
        validHours: 4
      }
    }
  ],

  // แผนการกินรายสัปดาห์ Template สำหรับ Meal Plan Creator (7 วัน 21 มื้อ)
  defaultMealPlanTemplates: {
    economyBudget: 1100, // งบประหยัด สัปดาห์ละ ~1,100 บาท (เฉลี่ย 52 บาท/มื้อ)
    days: [
      {
        day: 'วันจันทร์',
        breakfast: { stallId: 'EN-02', menu: 'ข้าวราดไข่พะโล้ + ผัดฟักทอง', price: 40, calories: 420 },
        lunch: { stallId: 'SC-01', menu: 'กะเพราไก่สับไข่ดาว', price: 50, calories: 550 },
        dinner: { stallId: 'SC-02', menu: 'เส้นหมี่น้ำใสลูกชิ้นหมู', price: 45, calories: 380 }
      },
      {
        day: 'วันอังคาร',
        breakfast: { stallId: 'SCI-02', menu: 'ข้าวมันไก่ตอนเนื้ออก ไม่หนัง', price: 45, calories: 480 },
        lunch: { stallId: 'TS-01', menu: 'ข้าวยำไก่แซ่บ รสจัด', price: 50, calories: 540 },
        dinner: { stallId: 'HOW-02', menu: 'ข้าวผัดต้มยำไก่ฮาลาล', price: 55, calories: 510 }
      },
      {
        day: 'วันพุธ',
        breakfast: { stallId: 'TS-02', menu: 'ปังปิ้งเนยนม + โอวัลตินร้อน', price: 40, calories: 350 },
        lunch: { stallId: 'EN-01', menu: 'สเต็กไก่พริกไทยดำเซตประหยัด', price: 69, calories: 590 },
        dinner: { stallId: 'OLB-01', menu: 'ข้าวขาหมูเนื้อล้วน ไม่มัน', price: 50, calories: 530 }
      },
      {
        day: 'วันพฤหัสบดี',
        breakfast: { stallId: 'EN-02', menu: 'ข้าวราดหมูกระเทียม + กุนเชียง', price: 45, calories: 490 },
        lunch: { stallId: 'SCI-01', menu: 'ราเมนซุปโชยุ หมูสไลซ์', price: 65, calories: 510 },
        dinner: { stallId: 'SC-01', menu: 'ข้าวผัดพริกเผาหมูชิ้น', price: 50, calories: 560 }
      },
      {
        day: 'วันศุกร์',
        breakfast: { stallId: 'HOW-01', menu: 'สลัดโรลอกไก่คลีน', price: 50, calories: 290 },
        lunch: { stallId: 'INTERZONE-02', menu: 'ส้มตำไทยไข่เค็ม + ข้าวเหนียว', price: 55, calories: 420 },
        dinner: { stallId: 'CHIENGRAK-02', menu: 'บะหมี่เกี๊ยวหมูแดงแห้ง', price: 50, calories: 480 }
      },
      {
        day: 'วันเสาร์',
        breakfast: { stallId: 'SC-03', menu: 'ชานมไข่มุก + แซนด์วิชโบราณ', price: 45, calories: 360 },
        lunch: { stallId: 'HOW-02', menu: 'ข้าวหมกไก่ทอดหอมเจียว', price: 60, calories: 580 },
        dinner: { stallId: 'INTERZONE-01', menu: 'ข้าวหน้าไก่ทอดเกาหลี', price: 79, calories: 650 }
      },
      {
        day: 'วันอาทิตย์',
        breakfast: { stallId: 'GYM-01', menu: 'ข้าวกล้องอกไก่ต้ม + ไข่ต้ม 2 ฟอง', price: 55, calories: 390 },
        lunch: { stallId: 'SC-02', menu: 'บะหมี่ต้มยำหมูสับมะนาวแท้', price: 45, calories: 440 },
        dinner: { stallId: 'CHIENGRAK-01', menu: 'หมูกระทะฉลองปิดสัปดาห์ (ใช้คูปองลด)', price: 149, calories: 850 }
      }
    ]
  }
};
