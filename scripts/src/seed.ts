import { db, categoriesTable, productsTable, dealerSchemesTable, bannersTable, usersTable } from "@workspace/db";
import bcrypt from "bcryptjs";

const categories = [
  { name: "CP Faucets", slug: "cp-faucets", description: "Chrome plated brass faucets for bathroom and kitchen", imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop" },
  { name: "PTMT Faucets", slug: "ptmt-faucets", description: "Premium PTMT material faucets", imageUrl: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=300&fit=crop" },
  { name: "Sanitaryware", slug: "sanitaryware", description: "WC, wash basins, urinals and cisterns", imageUrl: "https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?w=400&h=300&fit=crop" },
  { name: "Kitchen Sinks", slug: "kitchen-sinks", description: "Stainless steel and granite kitchen sinks", imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop" },
  { name: "Water Heaters", slug: "water-heaters", description: "Storage and instant water geysers", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop" },
  { name: "Bathroom Accessories", slug: "bathroom-accessories", description: "Towel rails, soap dishes, paper holders", imageUrl: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=300&fit=crop" },
  { name: "Pipes & Fittings", slug: "pipes-fittings", description: "UPVC, CPVC and PPR pipes and fittings", imageUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&fit=crop" },
  { name: "Flush Tanks", slug: "flush-tanks", description: "Concealed and exposed flush cisterns", imageUrl: "https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?w=400&h=300&fit=crop" },
];

const productImages: Record<string, string> = {
  "cp-faucets": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=400&fit=crop",
  "ptmt-faucets": "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=400&fit=crop",
  "sanitaryware": "https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?w=400&h=400&fit=crop",
  "kitchen-sinks": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
  "water-heaters": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
  "bathroom-accessories": "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=400&fit=crop",
  "pipes-fittings": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop",
  "flush-tanks": "https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?w=400&h=400&fit=crop",
};

interface ProductSeed {
  name: string; sku: string; price: number; mrp: number; description: string; specs?: string; warranty?: string;
  featured?: boolean; isNew?: boolean; rating?: number; reviews?: number;
}

const productsByCategory: Record<string, ProductSeed[]> = {
  "cp-faucets": [
    { name: "PRAYAG Aldus Single Lever Basin Faucet", sku: "PRY-CP-001", price: 1299, mrp: 1799, rating: 4.5, reviews: 234, featured: true, description: "Premium Chrome plated single lever basin faucet with ceramic disc technology. 360° swivel spout, quarter-turn handle for precise water flow control.", specs: "Material: Brass body, Chrome plating\nFlow Rate: 6 L/min\nMax Pressure: 10 bar\nCartridge: Ceramic disc", warranty: "5 years manufacturing warranty" },
    { name: "PRAYAG Zodiac Quarter Turn Pillar Cock", sku: "PRY-CP-002", price: 549, mrp: 799, rating: 4.2, reviews: 189, featured: true, description: "Classic pillar cock with quarter turn ceramic disc. Ideal for wash basins and sinks.", specs: "Material: Brass\nFinish: Chrome\nInlet: 1/2 inch BSP", warranty: "2 years warranty" },
    { name: "PRAYAG Orbis Single Lever Sink Faucet", sku: "PRY-CP-003", price: 2199, mrp: 2999, rating: 4.6, reviews: 156, isNew: true, description: "Modern single lever kitchen sink faucet with pull-out spray head. Dual spray modes.", specs: "Material: Brass\nSpray modes: Stream & Spray\nHose length: 60cm", warranty: "5 years warranty" },
    { name: "PRAYAG Florentine Pillar Tap", sku: "PRY-CP-004", price: 449, mrp: 649, rating: 4.1, reviews: 312, description: "Classic design pillar tap for bathrooms. Durable brass construction.", specs: "Thread: 1/2 inch BSP\nFlow rate: 8 L/min", warranty: "2 years warranty" },
    { name: "PRAYAG Aquamax Wall Mixer", sku: "PRY-CP-005", price: 3499, mrp: 4499, rating: 4.7, reviews: 98, featured: true, isNew: true, description: "Premium wall mounted mixer with diverter. Perfect for shower and bathtub combination.", specs: "Type: Wall Mounted\nMaterial: Brass\nConnection: 1/2 inch BSP", warranty: "7 years warranty" },
    { name: "PRAYAG Aqua Bib Cock", sku: "PRY-CP-006", price: 329, mrp: 499, rating: 4.0, reviews: 445, description: "Durable bib cock for garden or utility area use.", specs: "Material: Brass, Chrome finish\nThread: 1/2 inch BSP", warranty: "1 year warranty" },
    { name: "PRAYAG Crystal Long Body Pillar Cock", sku: "PRY-CP-007", price: 699, mrp: 999, rating: 4.3, reviews: 178, description: "Long body pillar cock for vessel-type wash basins.", specs: "Height: 300mm\nMaterial: Brass\nFinish: Chrome", warranty: "3 years warranty" },
    { name: "PRAYAG Zen Single Lever Diverter", sku: "PRY-CP-008", price: 4299, mrp: 5599, rating: 4.8, reviews: 67, featured: true, isNew: true, description: "Premium single lever bath/shower diverter with adjustable showerhead.", specs: "Type: In-wall\nPressure: 1-8 bar\nInlet: 1/2 inch", warranty: "10 years warranty" },
  ],
  "ptmt-faucets": [
    { name: "PRAYAG PTMT Pillar Cock Deluxe", sku: "PRY-PTMT-001", price: 299, mrp: 449, rating: 4.0, reviews: 523, featured: true, description: "Anti-bacterial PTMT material pillar cock. Rust proof and durable for Indian water conditions.", specs: "Material: PTMT\nAnti-bacterial: Yes\nThread: 1/2 inch", warranty: "5 years warranty" },
    { name: "PRAYAG PTMT Bib Cock Economy", sku: "PRY-PTMT-002", price: 219, mrp: 349, rating: 3.9, reviews: 892, description: "Economy bib cock in PTMT material. Ideal for outdoor and utility use.", specs: "Material: PTMT\nFinish: Chrome effect", warranty: "3 years warranty" },
    { name: "PRAYAG PTMT Sink Tap Premium", sku: "PRY-PTMT-003", price: 449, mrp: 599, rating: 4.2, reviews: 234, isNew: true, description: "Premium PTMT sink tap with swivel spout. Hygienic and durable.", specs: "Swivel angle: 120°\nSpout length: 170mm", warranty: "5 years warranty" },
    { name: "PRAYAG PTMT Angle Valve", sku: "PRY-PTMT-004", price: 189, mrp: 279, rating: 4.1, reviews: 634, featured: true, description: "Quarter turn PTMT angle valve for concealed pipework connections.", specs: "Size: 15mm (1/2 inch)\nType: Quarter turn ceramic disc", warranty: "5 years warranty" },
    { name: "PRAYAG PTMT Health Faucet Combo", sku: "PRY-PTMT-005", price: 549, mrp: 799, rating: 4.4, reviews: 412, isNew: true, description: "PTMT health faucet with 1.2m flexible hose. Complete combo pack.", specs: "Hose length: 1.2m\nMaterial: PTMT + SS hose", warranty: "2 years warranty" },
    { name: "PRAYAG PTMT Pillar Cock with Aerator", sku: "PRY-PTMT-006", price: 349, mrp: 499, rating: 4.2, reviews: 287, description: "PTMT pillar cock with built-in aerator for water saving.", specs: "Material: PTMT\nAerator: Yes (saves 40% water)", warranty: "5 years warranty" },
  ],
  "sanitaryware": [
    { name: "PRAYAG Zeno Wall Hung WC with Seat", sku: "PRY-SW-001", price: 8999, mrp: 12999, rating: 4.6, reviews: 134, featured: true, isNew: true, description: "Wall hung WC with rimless flush technology. Includes soft close seat cover. Easy clean surface.", specs: "Type: Wall hung\nFlush: 3/6 Litre dual flush\nDimensions: 540 x 380mm\nTrap: Horizontal", warranty: "10 years warranty" },
    { name: "PRAYAG Cascade One-Piece WC", sku: "PRY-SW-002", price: 6499, mrp: 8999, rating: 4.4, reviews: 178, featured: true, description: "Premium one-piece WC with concealed flush. Elegant design for modern bathrooms.", specs: "Type: One-piece\nFlush: 6L\nHeight: 400mm rim height", warranty: "10 years warranty" },
    { name: "PRAYAG Aria Wash Basin 450mm", sku: "PRY-SW-003", price: 2999, mrp: 3999, rating: 4.3, reviews: 256, description: "Wall mounted wash basin in premium vitreous china. 450mm width ideal for compact bathrooms.", specs: "Size: 450 x 320mm\nMaterial: Vitreous China\nType: Wall mounted", warranty: "5 years warranty" },
    { name: "PRAYAG Regent Pedestal Basin", sku: "PRY-SW-004", price: 4499, mrp: 5999, rating: 4.5, reviews: 189, isNew: true, description: "Full pedestal wash basin with classic design. Includes matching pedestal.", specs: "Size: 510 x 410mm\nWith: Full pedestal\nMaterial: Vitreous China", warranty: "5 years warranty" },
    { name: "PRAYAG Euro Counter Basin", sku: "PRY-SW-005", price: 3499, mrp: 4999, rating: 4.4, reviews: 134, featured: true, description: "Counter top wash basin in designer shape. Perfect for vessel-top installations.", specs: "Shape: Round\nSize: 400mm diameter\nHeight: 140mm", warranty: "5 years warranty" },
    { name: "PRAYAG Classic Two-Piece WC", sku: "PRY-SW-006", price: 4999, mrp: 6999, rating: 4.2, reviews: 267, description: "Classic two-piece WC with separate cistern. Durable and easy to maintain.", specs: "Type: Two-piece\nFlush: 6L\nIncludes: Soft close seat", warranty: "10 years warranty" },
  ],
  "kitchen-sinks": [
    { name: "PRAYAG Stainless 304 Double Bowl Sink", sku: "PRY-KS-001", price: 3499, mrp: 4999, rating: 4.5, reviews: 312, featured: true, description: "Premium 304 stainless steel double bowl kitchen sink with drain board. Anti-scratch satin finish.", specs: "Material: SS 304\nThickness: 0.8mm\nSize: 900 x 500mm\nBowl depth: 200mm", warranty: "10 years warranty" },
    { name: "PRAYAG Granite Composite Sink", sku: "PRY-KS-002", price: 5999, mrp: 7999, rating: 4.7, reviews: 189, isNew: true, featured: true, description: "Granite composite kitchen sink. Heat and scratch resistant. Available in multiple colors.", specs: "Material: Granite composite\nColors: Black/Grey/Beige\nSize: 780 x 500mm", warranty: "15 years warranty" },
    { name: "PRAYAG Single Bowl Undermount Sink", sku: "PRY-KS-003", price: 2499, mrp: 3499, rating: 4.3, reviews: 234, description: "Undermount single bowl sink for seamless kitchen countertop installation.", specs: "Material: SS 304\nSize: 600 x 450mm\nDepth: 220mm", warranty: "10 years warranty" },
    { name: "PRAYAG Economy Single Bowl Sink", sku: "PRY-KS-004", price: 1299, mrp: 1999, rating: 4.0, reviews: 567, description: "Economy single bowl sink in stainless steel. Perfect for budget kitchens.", specs: "Material: SS 202\nSize: 540 x 420mm", warranty: "5 years warranty" },
  ],
  "water-heaters": [
    { name: "PRAYAG Aqua Pro 15L Storage Geyser", sku: "PRY-WH-001", price: 5999, mrp: 7999, rating: 4.4, reviews: 423, featured: true, description: "15 litre vertical storage water heater with multi-functional safety valve. 5 star energy rating.", specs: "Capacity: 15 litres\nPower: 2000W\nEnergy rating: 5 star\nTank: Enamel coated", warranty: "7 years tank, 2 years element" },
    { name: "PRAYAG Instant 3L Electric Geyser", sku: "PRY-WH-002", price: 2499, mrp: 3499, rating: 4.2, reviews: 312, description: "3 litre instant water heater for instant hot water. Ideal for hand wash and small kitchens.", specs: "Capacity: 3 litres\nPower: 3000W\nInlet pressure: max 8 bar", warranty: "2 years warranty" },
    { name: "PRAYAG Aqua Pro 25L Storage Geyser", sku: "PRY-WH-003", price: 7999, mrp: 10999, rating: 4.5, reviews: 267, featured: true, isNew: true, description: "25 litre horizontal storage water heater. Suitable for family of 4+.", specs: "Capacity: 25 litres\nPower: 2000W\nOrientation: Horizontal/Vertical\nAnode: Magnesium", warranty: "7 years tank, 2 years element" },
    { name: "PRAYAG Flux Instant 6L Geyser", sku: "PRY-WH-004", price: 3499, mrp: 4999, rating: 4.3, reviews: 198, description: "6 litre instant water heater with advanced thermal cut-out.", specs: "Capacity: 6 litres\nPower: 3000W\nSafety: Multi-function valve", warranty: "3 years warranty" },
  ],
  "bathroom-accessories": [
    { name: "PRAYAG Orbit 5-Piece Bathroom Set", sku: "PRY-BA-001", price: 2499, mrp: 3499, rating: 4.5, reviews: 356, featured: true, isNew: true, description: "Complete 5-piece bathroom accessories set. Includes towel rod, soap dish, tumbler holder, towel ring and toilet paper holder.", specs: "Material: Zinc alloy + ABS\nFinish: Chrome\nPieces: 5\nMounting: Wall mounted", warranty: "5 years warranty" },
    { name: "PRAYAG Towel Rod 24 Inch", sku: "PRY-BA-002", price: 699, mrp: 999, rating: 4.3, reviews: 234, description: "24 inch double towel rod in stainless steel 304. Anti-rust and durable.", specs: "Material: SS 304\nSize: 24 inch (600mm)\nFinish: Mirror polished", warranty: "5 years warranty" },
    { name: "PRAYAG Health Faucet with Holder", sku: "PRY-BA-003", price: 449, mrp: 699, rating: 4.2, reviews: 678, description: "Health faucet with wall bracket and 1.5m flexible hose. Complete installation kit.", specs: "Hose length: 1.5m\nMaterial: ABS body, SS hose\nPressure: up to 8 bar", warranty: "2 years warranty" },
    { name: "PRAYAG Stainless Soap Dish", sku: "PRY-BA-004", price: 299, mrp: 449, rating: 4.1, reviews: 445, description: "Wall mounted stainless steel soap dish with drainage holes.", specs: "Material: SS 304\nMounting: Wall mounted\nFinish: Satin", warranty: "5 years warranty" },
    { name: "PRAYAG Shower Set with Overhead Rain", sku: "PRY-BA-005", price: 3999, mrp: 5999, rating: 4.6, reviews: 178, featured: true, isNew: true, description: "Premium shower set with 8-inch overhead rain shower and handheld shower.", specs: "Rain shower: 8 inch\nAdjustable: Yes\nFinish: Chrome", warranty: "5 years warranty" },
  ],
  "pipes-fittings": [
    { name: "PRAYAG CPVC Hot & Cold Pipe 1/2 inch (3m)", sku: "PRY-PF-001", price: 299, mrp: 449, rating: 4.4, reviews: 567, featured: true, description: "CPVC pipe suitable for both hot and cold water. ASTM standard. UV resistant.", specs: "Size: 1/2 inch (20mm)\nLength: 3 metres\nPressure rating: 25 bar\nTemp rating: up to 93°C", warranty: "10 years warranty" },
    { name: "PRAYAG UPVC Pipe 3/4 inch (6m)", sku: "PRY-PF-002", price: 399, mrp: 549, rating: 4.2, reviews: 389, description: "UPVC pressure pipe for cold water applications.", specs: "Size: 3/4 inch (25mm)\nLength: 6 metres\nPressure: 10 bar", warranty: "10 years warranty" },
    { name: "PRAYAG CPVC Elbow Set (10 pieces)", sku: "PRY-PF-003", price: 249, mrp: 399, rating: 4.3, reviews: 445, featured: true, description: "CPVC 90° elbow fittings set. Pack of 10 pieces.", specs: "Size: 1/2 inch\nType: 90° elbow\nMaterial: CPVC\nPack: 10 pieces", warranty: "5 years warranty" },
    { name: "PRAYAG PTMT Ball Valve 1/2 inch", sku: "PRY-PF-004", price: 199, mrp: 299, rating: 4.5, reviews: 678, description: "Full bore ball valve in PTMT material for main shut-off application.", specs: "Size: 1/2 inch\nType: Full bore\nMaterial: PTMT + Brass ball", warranty: "5 years warranty" },
    { name: "PRAYAG Flexible Hose 50cm Pair", sku: "PRY-PF-005", price: 349, mrp: 499, rating: 4.3, reviews: 334, description: "Pair of flexible hoses for connecting faucets. 50cm with standard connectors.", specs: "Length: 50cm\nConnection: 3/8 inch both ends\nMaterial: SS braided\nPack: 2 hoses", warranty: "2 years warranty" },
  ],
  "flush-tanks": [
    { name: "PRAYAG Concealed Flush System", sku: "PRY-FT-001", price: 4999, mrp: 6999, rating: 4.5, reviews: 234, featured: true, isNew: true, description: "In-wall concealed flush system with dual flush mechanism. Slim design for space saving.", specs: "Capacity: 3/6 litre\nType: Concealed\nFrame: Galvanised steel\nButton: Round chrome", warranty: "10 years warranty" },
    { name: "PRAYAG PVC Flush Tank Economy", sku: "PRY-FT-002", price: 699, mrp: 999, rating: 4.0, reviews: 456, description: "PVC flush tank for standard WC. Easy installation and maintenance.", specs: "Capacity: 10 litre\nType: Exposed\nMaterial: PVC\nFlushing: Single flush", warranty: "3 years warranty" },
    { name: "PRAYAG Slimline Flush Tank", sku: "PRY-FT-003", price: 1499, mrp: 1999, rating: 4.2, reviews: 178, description: "Space saving slimline flush tank for modern wall-hung WCs.", specs: "Capacity: 6 litre\nWidth: 100mm slim\nMaterial: PP", warranty: "5 years warranty" },
  ],
};

async function seed() {
  console.log("Starting PRAYAG seed...");

  // Seed admin user
  const existing = await db.select().from(usersTable);
  if (existing.length === 0) {
    const adminHash = await bcrypt.hash("password123", 10);
    await db.insert(usersTable).values([
      { name: "Admin User", email: "admin@prayag.com", passwordHash: adminHash, role: "admin" },
      { name: "Test Customer", email: "customer@prayag.com", passwordHash: adminHash, role: "customer" },
      { name: "Sharma Sanitaryware", email: "dealer@prayag.com", passwordHash: adminHash, role: "dealer" },
    ]);
    console.log("  Users seeded");
  }

  // Seed categories
  const existingCats = await db.select().from(categoriesTable);
  if (existingCats.length === 0) {
    await db.insert(categoriesTable).values(categories);
    console.log("  Categories seeded");
  }

  // Get category ids
  const cats = await db.select().from(categoriesTable);
  const catMap = Object.fromEntries(cats.map(c => [c.slug, c.id]));

  // Seed products
  const existingProds = await db.select().from(productsTable);
  if (existingProds.length === 0) {
    for (const [catSlug, products] of Object.entries(productsByCategory)) {
      const categoryId = catMap[catSlug];
      if (!categoryId) continue;
      for (const p of products) {
        await db.insert(productsTable).values({
          name: p.name,
          slug: p.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").substring(0, 80),
          sku: p.sku,
          price: p.price.toString(),
          mrp: p.mrp.toString(),
          gstPercent: "18",
          categoryId,
          description: p.description,
          specifications: p.specs || null,
          warranty: p.warranty || null,
          imageUrl: productImages[catSlug] || null,
          rating: (p.rating || 4.0).toString(),
          reviewCount: p.reviews || 0,
          isFeatured: p.featured || false,
          isNew: p.isNew || false,
          inStock: true,
        });
      }
    }
    console.log("  Products seeded");
  }

  // Seed dealer schemes
  const existingSchemes = await db.select().from(dealerSchemesTable);
  if (existingSchemes.length === 0) {
    await db.insert(dealerSchemesTable).values([
      { title: "Festival Season Bonus", description: "Extra 5% discount on all CP faucets during festival season. Valid on minimum order of ₹50,000.", discount: "5.00", validUntil: "2024-12-31", isActive: "true" },
      { title: "New Dealer Welcome Scheme", description: "Special 10% off on first 3 orders for newly enrolled dealers. Great start for new partnerships.", discount: "10.00", validUntil: "2025-03-31", isActive: "true" },
      { title: "Bulk Order Discount", description: "15% additional discount on orders above ₹2,00,000. Ideal for large project requirements.", discount: "15.00", validUntil: "2025-06-30", isActive: "true" },
    ]);
    console.log("  Dealer schemes seeded");
  }

  console.log("✅ Seed complete!");
}

seed().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
