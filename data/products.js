const products = [
    {
      name: "Rifle de caza XH-200",
      description: "Rifle de caza profesional con precisión excepcional. Ideal para cazadores experimentados que buscan máximo rendimiento y fiabilidad en sus expediciones. Fabricado con materiales de alta calidad y diseñado para durar años de uso intensivo.",
      price: 12999.99,
      discount: 10,
      stock: 15,
      category: "armas",
      images: [
        "/rifle.webp",
        "/rifle2.jpeg",
        "/rifle3.jpeg"
      ],
      specifications: {
        material: "Acero inoxidable y polímeros de alta resistencia",
        length: "110 cm",
        weight: "3.2 kg",
        caliber: ".308 Winchester",
        capacity: "5 + 1 balas",
        scope: "Incluida (4-16x50mm)",
        warranty: "5 años del fabricante"
      },
      featured: true
    },
    {
      name: "Chaqueta Camuflaje Premium",
      description: "Chaqueta resistente al agua con patrón de camuflaje forestal. Perfecta para mantener el calor y la sequedad durante largas jornadas de caza. Cuenta con múltiples bolsillos y un forro térmico desmontable.",
      price: 2499.99,
      discount: 0,
      stock: 8,
      category: "ropa",
      images: [
        "/chaqueta.jpeg"
      ],
      specifications: {
        material: "Poliéster resistente al agua",
        size: "Disponible en S, M, L, XL, XXL",
        waterproof: "Sí, 10,000mm",
        pockets: "6 externos, 2 internos",
        color: "Camuflaje forestal",
        weight: "1.2 kg"
      },
      featured: true
    },
    {
      name: "Kit de Carnada Profesional",
      description: "Set completo con diferentes tipos de carnada para diversos animales. Incluye atrayentes sintéticos y naturales de alta efectividad para diferentes especies de caza mayor y menor.",
      price: 899.99,
      discount: 0,
      stock: 30,
      category: "carnada",
      images: [
        "/kit_carnada.jpeg"
      ],
      specifications: {
        contents: "12 tipos diferentes de carnada",
        weight: "1.5 kg total",
        effectiveness: "Probada en campo",
        shelfLife: "12 meses",
        storage: "Mantener en lugar fresco y seco"
      },
      featured: true
    },
    {
      name: "Botas de Caza Impermeables",
      description: "Botas de alta resistencia con suela antideslizante para terrenos difíciles. Diseñadas para proporcionar comodidad y protección en todo tipo de terrenos y condiciones climáticas.",
      price: 1899.99,
      discount: 0,
      stock: 12,
      category: "ropa",
      images: [
        "/botas_impermeable.webp"
      ],
      specifications: {
        material: "Cuero y Gore-Tex",
        height: "25 cm",
        waterproof: "100% impermeable",
        insulation: "Thinsulate 400g",
        sole: "Vibram antideslizante",
        weight: "1.1 kg por bota"
      },
      featured: false
    },
    {
      name: "Mira Telescópica HD 4-16x50mm",
      description: "Mira telescópica de alta definición con zoom de 4x a 16x. Perfecta para tiros de larga distancia con claridad excepcional y ajustes precisos.",
      price: 4999.99,
      discount: 0,
      stock: 5,
      category: "accesorios",
      images: [
        "/mira_telescopica.webp"
      ],
      specifications: {
        magnification: "4-16x",
        objectiveDiameter: "50mm",
        eyeRelief: "3.5 pulgadas",
        tubeSize: "30mm",
        reticle: "Iluminado, mil-dot",
        weight: "680g"
      },
      featured: false
    },
    {
      name: "Kit de Limpieza para Rifles",
      description: "Kit completo para la limpieza y mantenimiento de rifles. Incluye todos los implementos necesarios para mantener tu arma en perfectas condiciones.",
      price: 599.99,
      discount: 0,
      stock: 25,
      category: "accesorios",
      images: [
        "/kit.jpg"
      ],
      specifications: {
        contents: "Baquetas, cepillos, paños, solventes",
        compatibility: "Para calibres .22 a .30",
        case: "Estuche rígido con compartimentos",
        weight: "800g"
      },
      featured: false
    },
    {
      name: "Munición Premium .308",
      description: "Caja de munición calibre .308 de alta precisión. Diseñada para máxima precisión y consistencia en cada disparo.",
      price: 799.99,
      discount: 0,
      stock: 50,
      category: "armas",
      images: [
        "/balas.webp"
      ],
      specifications: {
        caliber: ".308 Winchester",
        quantity: "20 cartuchos por caja",
        bulletWeight: "168 grains",
        bulletType: "BTHP (Boat Tail Hollow Point)",
        muzzleVelocity: "2700 fps"
      },
      featured: false
    },
    {
      name: "Tienda de Campaña Camuflaje",
      description: "Tienda de campaña resistente con patrón de camuflaje. Perfecta para acampar durante expediciones de caza de varios días.",
      price: 3499.99,
      discount: 0,
      stock: 3,
      category: "accesorios",
      images: [
        "/campaña.jpeg"
      ],
      specifications: {
        capacity: "2-3 personas",
        dimensions: "210 x 210 x 130 cm",
        weight: "3.5 kg",
        waterproof: "5000mm",
        material: "Poliéster ripstop",
        poles: "Fibra de vidrio"
      },
      featured: false
    }
  ];
  
  export default products;