/**
 * Visual demo fixtures only. Never seed the real local catalog with these rows.
 * Official product names, SKUs and gallery URLs: docs/demo-image-sources.md.
 * Chinese names are convenience translations; colors are presentation choices.
 * Condition and USD purchase/target amounts are fictional demo values.
 * No official prices, release dates or sales/retirement statuses are asserted.
 */
export interface DemoProduct {
  id: string;
  nameZh: string;
  nameEn: string;
  sku: string;
  size: string;
  category: '公仔' | '挂件' | '其他';
  family: '兔兔家族' | '软萌动物' | '趣味食物' | '随身挂件';
  photos: string[];
  sourceUrl: string;
  color: string;
  condition: 'NWT' | 'NWOT' | 'EUC' | 'GUC' | 'UC';
  purchasePrice: number;
  targetLow: number;
  targetHigh: number;
}

export const demoProducts: DemoProduct[] = [
  {
    "id": "demo-cream-bunny",
    "nameZh": "奶油白害羞兔",
    "nameEn": "Bashful Cream Bunny",
    "sku": "BAS3BC",
    "size": "Original",
    "category": "公仔",
    "family": "兔兔家族",
    "photos": [
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/297/1324/BASHFUL_BUNNY_CREAM__01082.1749467902.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/297/1326/BASHFUL_BUNNY_CREAM_2__91550.1732743690.jpg?c=1"
    ],
    "sourceUrl": "https://us.jellycat.com/bashful-cream-bunny/",
    "color": "#F2ECE1",
    "condition": "NWT",
    "purchasePrice": 28,
    "targetLow": 38,
    "targetHigh": 48
  },
  {
    "id": "demo-bartholomew-bear",
    "nameZh": "巴塞罗缪棕熊",
    "nameEn": "Bartholomew Bear",
    "sku": "BARM3BR",
    "size": "Medium",
    "category": "公仔",
    "family": "软萌动物",
    "photos": [
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/322/52679/BARM3BR__22606.1773232036.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/322/1273/BARTHOLOMEW_BEAR_2__02104.1714752541.jpg?c=1"
    ],
    "sourceUrl": "https://us.jellycat.com/bartholomew-bear/",
    "color": "#EEE0CD",
    "condition": "EUC",
    "purchasePrice": 30,
    "targetLow": 42,
    "targetHigh": 55
  },
  {
    "id": "demo-coffee-cup",
    "nameZh": "趣味拿铁咖啡杯",
    "nameEn": "Amuseables Coffee Cup",
    "sku": "A6COFC",
    "size": "",
    "category": "公仔",
    "family": "趣味食物",
    "photos": [
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/221/48660/A6COFC__39853.1732743445.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/221/48662/A6COFC_2__06441.1732743447.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/221/48663/A6COFC_3__18262.1732743448.jpg?c=1"
    ],
    "sourceUrl": "https://us.jellycat.com/amuseables-coffee-cup/",
    "color": "#EDE3D8",
    "condition": "NWT",
    "purchasePrice": 28,
    "targetLow": 40,
    "targetHigh": 52
  },
  {
    "id": "demo-avocado",
    "nameZh": "趣味鳄梨",
    "nameEn": "Amuseables Avocado",
    "sku": "A2A",
    "size": "",
    "category": "公仔",
    "family": "趣味食物",
    "photos": [
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/113/423/AMUSEABLE_AVOCADO__51569.1738949059.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/113/425/AMUSEABLE_AVOCADO_2__24565.1738949059.jpg?c=1"
    ],
    "sourceUrl": "https://us.jellycat.com/amuseables-avocado/",
    "color": "#E7ECD8",
    "condition": "EUC",
    "purchasePrice": 24,
    "targetLow": 34,
    "targetHigh": 46
  },
  {
    "id": "demo-willow-bunny",
    "nameZh": "Willow 奶油金兔",
    "nameEn": "Bashful Luxe Bunny Willow",
    "sku": "BAS3WIL",
    "size": "Original",
    "category": "公仔",
    "family": "兔兔家族",
    "photos": [
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/313/1655/BASHFUL_LUXE_WILLOW__42847.1750296044.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/313/1656/BASHFUL_LUXE_WILLOW_2__35078.1732743774.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/313/1657/BASHFUL_LUXE_WILLOW_3__90041.1732743774.jpg?c=1"
    ],
    "sourceUrl": "https://us.jellycat.com/bashful-luxe-bunny-willow/",
    "color": "#EFE7D9",
    "condition": "NWT",
    "purchasePrice": 35,
    "targetLow": 48,
    "targetHigh": 62
  },
  {
    "id": "demo-blush-bunny",
    "nameZh": "腮红粉害羞兔",
    "nameEn": "Bashful Blush Bunny",
    "sku": "BAS3BLU",
    "size": "Original",
    "category": "公仔",
    "family": "兔兔家族",
    "photos": [
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/302/51604/BASHFUL_BUNNY_BLUSH__79317.1762806366.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/302/51608/BASHFUL_BUNNY_BLUSH_2__61757.1762950375.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/302/51602/BAS3BLU_3__00914.1762806366.jpg?c=1"
    ],
    "sourceUrl": "https://us.jellycat.com/bashful-blush-bunny/",
    "color": "#F5E7E3",
    "condition": "NWOT",
    "purchasePrice": 26,
    "targetLow": 36,
    "targetHigh": 46
  },
  {
    "id": "demo-patchwork-bunny",
    "nameZh": "拼布棕色害羞兔",
    "nameEn": "Bashful Patchwork Brown Bunny",
    "sku": "BAS3PWB",
    "size": "Original",
    "category": "公仔",
    "family": "兔兔家族",
    "photos": [
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/1761/49635/BAS3PWB__84420.1741618117.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/1761/49636/BAS3PWB_2__38805.1741618118.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/1761/49637/BAS3PWB_3__82746.1741618119.jpg?c=1"
    ],
    "sourceUrl": "https://us.jellycat.com/bashful-patchwork-brown-bunny/",
    "color": "#EFE5D8",
    "condition": "NWT",
    "purchasePrice": 38,
    "targetLow": 52,
    "targetHigh": 68
  },
  {
    "id": "demo-smudge-elephant",
    "nameZh": "趴趴小象",
    "nameEn": "Smudge Elephant",
    "sku": "SMG2EL",
    "size": "",
    "category": "公仔",
    "family": "软萌动物",
    "photos": [
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/1288/45781/SMG2EL__95591.1727981224.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/1288/45782/SMG2EL_2__44624.1727981225.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/1288/45783/SMG2EL_3__92591.1727981226.jpg?c=1"
    ],
    "sourceUrl": "https://us.jellycat.com/smudge-elephant/",
    "color": "#EBE9E5",
    "condition": "NWT",
    "purchasePrice": 32,
    "targetLow": 44,
    "targetHigh": 58
  },
  {
    "id": "demo-ricky-frog",
    "nameZh": "Ricky 雨蛙",
    "nameEn": "Ricky Rain Frog",
    "sku": "RR3F",
    "size": "",
    "category": "公仔",
    "family": "软萌动物",
    "photos": [
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/1184/51540/RICKY_RAIN_FROG__54785.1762532862.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/1184/51535/RR3F_2__62510.1762532861.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/1184/51534/RICKY_RAIN_FROG_3__55219.1762532861.jpg?c=1"
    ],
    "sourceUrl": "https://us.jellycat.com/ricky-rain-frog/",
    "color": "#E8EDDA",
    "condition": "GUC",
    "purchasePrice": 25,
    "targetLow": 34,
    "targetHigh": 45
  },
  {
    "id": "demo-bashful-kitten",
    "nameZh": "害羞小猫",
    "nameEn": "Bashful Kitten",
    "sku": "BAS3KTN",
    "size": "Original",
    "category": "公仔",
    "family": "软萌动物",
    "photos": [
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/1737/49506/BAS3KTN__74868.1738932815.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/1737/49507/BAS3KTN_2__14867.1738932816.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/1737/49508/BAS3KTN_3__66020.1738932817.jpg?c=1"
    ],
    "sourceUrl": "https://us.jellycat.com/bashful-kitten-original/",
    "color": "#F1ECE4",
    "condition": "NWOT",
    "purchasePrice": 24,
    "targetLow": 34,
    "targetHigh": 44
  },
  {
    "id": "demo-croissant",
    "nameZh": "趣味可颂",
    "nameEn": "Amuseables Croissant",
    "sku": "A6C",
    "size": "Small",
    "category": "公仔",
    "family": "趣味食物",
    "photos": [
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/140/50263/A6C__94924.1749834184.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/140/50265/A6C_2__63565.1749834186.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/140/50266/A6C_3__10421.1749834187.jpg?c=1"
    ],
    "sourceUrl": "https://us.jellycat.com/amuseables-croissant/",
    "color": "#F2E5D1",
    "condition": "NWT",
    "purchasePrice": 20,
    "targetLow": 30,
    "targetHigh": 40
  },
  {
    "id": "demo-coffee-bean",
    "nameZh": "趣味咖啡豆",
    "nameEn": "Amuseables Coffee Bean",
    "sku": "A6CB",
    "size": "",
    "category": "公仔",
    "family": "趣味食物",
    "photos": [
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/218/48644/A6CB__22707.1732743422.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/218/48646/A6CB_2__66793.1732743424.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/218/48647/A6CB_3__92251.1732743425.jpg?c=1"
    ],
    "sourceUrl": "https://us.jellycat.com/amuseables-coffee-bean/",
    "color": "#EBDDCE",
    "condition": "UC",
    "purchasePrice": 18,
    "targetLow": 26,
    "targetHigh": 36
  },
  {
    "id": "demo-beige-bunny-charm",
    "nameZh": "米色害羞兔挂件",
    "nameEn": "Bashful Beige Bunny Bag Charm",
    "sku": "BAS4BEBC",
    "size": "",
    "category": "挂件",
    "family": "随身挂件",
    "photos": [
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/1683/49222/BAS4BEBC__54759.1734429593.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/1683/49223/BAS4BEBC_2__51979.1734429594.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/1683/49224/BAS4BEBC_3__97391.1734429594.jpg?c=1"
    ],
    "sourceUrl": "https://us.jellycat.com/bashful-beige-bunny-bag-charm-1/",
    "color": "#EEE5D7",
    "condition": "NWT",
    "purchasePrice": 18,
    "targetLow": 26,
    "targetHigh": 34
  },
  {
    "id": "demo-bear-charm",
    "nameZh": "巴塞罗缪熊挂件",
    "nameEn": "Bartholomew Bear Bag Charm",
    "sku": "BAR4BC",
    "size": "",
    "category": "挂件",
    "family": "随身挂件",
    "photos": [
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/318/49845/BAR4BC__04475.1744189905.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/318/49846/BAR4BC_2__25387.1744189905.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/318/49847/BAR4BC_3__59267.1744189906.jpg?c=1"
    ],
    "sourceUrl": "https://us.jellycat.com/bartholomew-bear-bag-charm/",
    "color": "#ECDFCD",
    "condition": "NWOT",
    "purchasePrice": 20,
    "targetLow": 28,
    "targetHigh": 38
  },
  {
    "id": "demo-croissant-charm",
    "nameZh": "可颂挂件",
    "nameEn": "Amuseables Croissant Bag Charm",
    "sku": "A4CROBC",
    "size": "",
    "category": "挂件",
    "family": "随身挂件",
    "photos": [
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/193/40878/A4CROBC__14603.1727974878.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/193/40879/A4CROBC_2__98455.1727974879.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/193/40880/A4CROBC_3__69503.1727974880.jpg?c=1"
    ],
    "sourceUrl": "https://us.jellycat.com/amuseables-croissant-bag-charm/",
    "color": "#F3E5CD",
    "condition": "NWT",
    "purchasePrice": 16,
    "targetLow": 24,
    "targetHigh": 32
  },
  {
    "id": "demo-frog-charm",
    "nameZh": "Ricky 雨蛙挂件",
    "nameEn": "Ricky Rain Frog Bag Charm",
    "sku": "RR4BCF",
    "size": "",
    "category": "挂件",
    "family": "随身挂件",
    "photos": [
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/1187/45301/RR4BCF__65183.1727980646.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/1187/45302/RR4BCF_2__64568.1727980647.jpg?c=1",
      "https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/stencil/1000w/products/1187/45303/RR4BCF_3__68429.1727980647.jpg?c=1"
    ],
    "sourceUrl": "https://us.jellycat.com/ricky-rain-frog-bag-charm/",
    "color": "#E4EBD6",
    "condition": "EUC",
    "purchasePrice": 18,
    "targetLow": 26,
    "targetHigh": 35
  }
];

