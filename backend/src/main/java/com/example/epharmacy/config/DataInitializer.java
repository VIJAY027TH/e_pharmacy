package com.example.epharmacy.config;

import com.example.epharmacy.entity.Category;
import com.example.epharmacy.entity.Medicine;
import com.example.epharmacy.entity.RoleName;
import com.example.epharmacy.entity.User;
import com.example.epharmacy.repository.CategoryRepository;
import com.example.epharmacy.repository.MedicineRepository;
import com.example.epharmacy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/** Seeds only the initial administrator and fictional local-demo catalog. */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final MedicineRepository medicineRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${PHARMAVITAL_ADMIN_PASSWORD:#{null}}")
    private String adminPassword;

    public DataInitializer(UserRepository userRepository, CategoryRepository categoryRepository,
                           MedicineRepository medicineRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.medicineRepository = medicineRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void setAdminPassword(String adminPassword) {
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findAll().stream().noneMatch(user -> user.getRole() == RoleName.ROLE_ADMIN)) {
            String password = (adminPassword != null && !adminPassword.isBlank())
                    ? adminPassword.trim()
                    : System.getenv("PHARMAVITAL_ADMIN_PASSWORD");

            if (password == null || password.isBlank()) {
                throw new IllegalStateException(
                        "Required environment variable PHARMAVITAL_ADMIN_PASSWORD is not set. Cannot initialize administrator account."
                );
            }

            userRepository.save(new User(
                    "PharmaVital Admin",
                    "admin@pharmavital.com",
                    passwordEncoder.encode(password.trim()),
                    null,
                    null,
                    RoleName.ROLE_ADMIN
            ));
        }

        if (categoryRepository.count() == 0 && medicineRepository.count() == 0) {
            seedDemoCatalog();
        }
    }

    private void seedDemoCatalog() {
        Category daily = category("Primary Vitality & Daily Health", "Foundational daily wellness essentials, active multivitamins, and preventive health supplements.");
        Category respiratory = category("Pulmonary & Respiratory Care", "Advanced respiratory therapeutics, bronchial formulations, and clinical inhalation solutions.");
        Category digestive = category("Gastrointestinal & Digestive Health", "Targeted gut microflora restoration, digestive enzymes, and clinical gastro-relief formulations.");
        Category skin = category("Dermatological & Clinical Skincare", "Dermatologist-formulated barrier repair emulsions, therapeutic cleansers, and advanced topical care.");
        Category womens = category("Endocrine & Women's Health", "Comprehensive hormonal balance formulations, reproductive wellness, and targeted cellular nutrition.");
        Category mens = category("Cardiovascular & Men's Health", "Targeted vitality boosters, cellular energy complexes, and endurance electrolyte nutrition.");
        Category immunity = category("Immunological Defense & Nutrition", "Bioactive immune-potentiating complexes, clinical grade antioxidants, and micronutrient therapy.");

        add("AuraVital Complete", "AuraVital Labs", "Bioactive multivitamin, chelated zinc, botanical micronutrient complex", "30 tablets", 30, "tablets", "High-potency broad-spectrum multivitamin designed to sustain cellular energy and daily micronutrient balance.", "245.00", 84, daily, false, "Daily vitality & wellness");
        add("CalciD3 Max Bioactive", "AuraVital Labs", "Cholecalciferol (Vitamin D3 60,000 IU equivalent), Vitamin K2-MK7 in virgin organic MCT base", "60 softgels", 60, "softgels", "High-absorption therapeutic Vitamin D3 and K2 softgels for bone density, calcium homeostasis, and immune resilience.", "195.00", 112, daily, false, "Bone & calcium metabolism");
        add("BronchoClear Isotonic Mist", "Aeris Pharma", "Hypertonic micro-saline solution with natural eucalyptus and purified xylitol", "100 ml", 100, "ml", "Sterile isotonic inhalation mist formulated to clear congestion, relieve mucous build-up, and soothe upper airway passages.", "165.00", 46, respiratory, false, "Upper respiratory congestion");
        add("PulmoVent Forte Rx", "Aeris Pharma", "Sustained-release clinical bronchial modulator & anti-inflammatory broncho-complex", "20 capsules", 20, "capsules", "Prescription-grade therapeutic respiratory capsules formulated for targeted bronchial airflow management.", "385.00", 28, respiratory, true, "Chronic bronchial airway management");
        add("EnzyDigest Symbiotic Pro", "GastroNorm Labs", "Prebiotic FOS with 15 Billion CFU multi-strain microencapsulated synbiotic spores", "30 sachets", 30, "sachets", "Clinical prebiotic and probiotic synbiotic formulation engineered to rebalance intestinal microflora and optimize nutrient absorption.", "285.00", 57, digestive, false, "Gut microbiome imbalance");
        add("GastroEase Dual Action", "GastroNorm Labs", "Herbal digestive enzyme matrix with standardized ginger, peppermint, and artichoke extracts", "30 capsules", 30, "capsules", "Fast-acting digestive comfort capsules providing comprehensive post-meal enzymatic support against bloating and acidity.", "220.00", 63, digestive, false, "Acid reflux & dyspepsia");
        add("CeramideBarrier Intensive Cream", "Dermacell Rx", "Triple essential ceramide complex (1, 3, 6-II), 2% hyaluronic acid, and pure colloidal oat", "200 ml", 200, "ml", "Clinical lipid-replenishing barrier repair emulsion designed for intense cutaneous hydration and compromised skin barriers.", "345.00", 39, skin, false, "Eczematous & compromised skin barrier");
        add("Dermacell Purifying Clarifier", "Dermacell Rx", "Micro-micellar amino acid surfactant blend with 1.5% salicylic acid and niacinamide", "150 ml", 150, "ml", "Gentle non-stripping therapeutic dermatological cleanser to clear impurities while preserving the natural stratum corneum pH.", "195.00", 5, skin, false, "Dermatological pore refinement");
        add("FeminaPlex Daily Balance", "FeminaPlex Care", "Standardized myo-inositol, Vitex agnus-castus, folate (L-methylfolate), and evening primrose extract", "30 tablets", 30, "tablets", "Botanical and micronutrient formulation crafted to support balanced female endocrine rhythms and reproductive vitality.", "295.00", 42, womens, false, "Hormonal balance & cycle rhythm");
        add("FeminaFem Forte Rx", "FeminaPlex Care", "Prescription bio-identical herbal synergistic formulation with concentrated phyto-phytoestrogen co-factors", "20 capsules", 20, "capsules", "Physician-supervised prescription women's hormonal regulation therapy for specialized clinical management.", "395.00", 18, womens, true, "Clinical endocrine therapy");
        add("VigorMax Men Prime", "VigorMax Health", "High-purity KSM-66 Ashwagandha, purified Shilajit, fenugreek saponins, and elemental zinc", "30 sachets", 30, "sachets", "Advanced performance formula formulated to promote vitality, physical endurance, and healthy metabolic vigor in men.", "310.00", 35, mens, false, "Physical stamina & vigor");
        add("Electrolyfe RapidHydrate", "VigorMax Health", "WHO-standard isotonic oral rehydration salts with potassium, magnesium, and bio-citrates", "12 sachets", 12, "sachets", "Clinical osmotic electrolyte hydration matrix designed for rapid recovery from fatigue and dehydration.", "145.00", 76, mens, false, "Osmotic cellular rehydration");
        add("ImmunoShield Ultra Defense", "ImmunoShield Labs", "Standardized elderberry extract, 1000mg buffered Vitamin C, beta-glucans, and organic selenium", "60 capsules", 60, "capsules", "Potent immune-potentiating nutraceutical complex formulated for cellular barrier defense and systemic antioxidant protection.", "365.00", 91, immunity, false, "Cellular immune resistance");
        add("MineralCell Complete Complex", "ImmunoShield Labs", "Full-spectrum colloidal trace mineral complex with ionized ionic fulvic acid", "20 sachets", 20, "sachets", "Essential micronutrient and ionic trace mineral supplement supporting optimal enzymatic activity and metabolic cellular function.", "185.00", 3, immunity, false, "Trace mineral deficiency");
    }

    private Category category(String name, String description) {
        return categoryRepository.save(new Category(name, description));
    }

    private void add(String name, String brand, String composition, String dosage,
                     int unitsPerPack, String unitType,
                     String description, String price, int stock, Category category,
                     boolean requiresPrescription, String ailment) {
        Medicine medicine = new Medicine();
        medicine.setName(name);
        medicine.setBrand(brand);
        medicine.setComposition(composition);
        medicine.setDosage(dosage);
        medicine.setUnitsPerPack(unitsPerPack);
        medicine.setUnitType(unitType);
        medicine.setDescription(description);
        medicine.setPrice(new BigDecimal(price));
        medicine.setStockQuantity(stock);
        medicine.setCategory(category);
        medicine.setRequiresPrescription(requiresPrescription);
        medicine.setImageUrl(switch (category.getName()) {
            case "Primary Vitality & Daily Health" -> "/products/daily-wellness.svg";
            case "Pulmonary & Respiratory Care" -> "/products/respiratory-care.svg";
            case "Gastrointestinal & Digestive Health" -> "/products/digestive-health.svg";
            case "Dermatological & Clinical Skincare" -> "/products/skin-personal-care.svg";
            case "Endocrine & Women's Health" -> "/products/womens-wellness.svg";
            case "Cardiovascular & Men's Health" -> "/products/mens-wellness.svg";
            default -> "/products/immunity-nutrition.svg";
        });
        medicine.setAilment(ailment);
        medicineRepository.save(medicine);
    }
}
