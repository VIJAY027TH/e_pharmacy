package com.example.epharmacy.config;

import com.example.epharmacy.entity.Category;
import com.example.epharmacy.entity.Medicine;
import com.example.epharmacy.entity.RoleName;
import com.example.epharmacy.entity.User;
import com.example.epharmacy.repository.CategoryRepository;
import com.example.epharmacy.repository.MedicineRepository;
import com.example.epharmacy.repository.UserRepository;
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

    public DataInitializer(UserRepository userRepository, CategoryRepository categoryRepository,
                           MedicineRepository medicineRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.medicineRepository = medicineRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findAll().stream().noneMatch(user -> user.getRole() == RoleName.ROLE_ADMIN)) {
            userRepository.save(new User(
                    "Administrator",
                    "admin@epharmacy.com",
                    passwordEncoder.encode("Admin@123"),
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
        Category daily = category("Daily Wellness", "Everyday personal wellness and routine care products.");
        Category respiratory = category("Respiratory Care", "Fictional demonstration products for the respiratory care range.");
        Category digestive = category("Digestive Health", "Fictional demonstration products for digestive wellness.");
        Category skin = category("Skin & Personal Care", "Personal care products for the PharmaVital demonstration catalog.");
        Category womens = category("Women's Wellness", "Fictional products for the women's wellness range.");
        Category mens = category("Men's Wellness", "Fictional products for the men's wellness range.");
        Category immunity = category("Immunity & Nutrition", "Demonstration nutrition and daily supplement products.");

        add("VitaCore Daily", "VitaCore", "Demo botanical blend", "30 tablets", "Fictional demonstration wellness product. Not intended for diagnosis or treatment.", "18.50", 84, daily, false, "Daily wellness");
        add("Wellness D3", "VitaCore", "Demo nutrient blend", "60 softgels", "Fictional demonstration nutrition product. Not intended for diagnosis or treatment.", "12.25", 112, daily, false, "Daily wellness");
        add("RespiraEase Mist", "Airwell", "Demo saline blend", "100 ml", "Fictional demonstration personal care product. Follow the product label.", "9.90", 46, respiratory, false, "Respiratory care");
        add("RespiraEase Rx", "Airwell", "Demonstration formulation", "20 capsules", "Fictional prescription-only demo item for workflow demonstrations; not a real medicine.", "24.00", 28, respiratory, true, "Respiratory care");
        add("GastroCalm Balance", "CoreKind", "Demo fiber blend", "30 sachets", "Fictional demonstration wellness product. Not intended for diagnosis or treatment.", "16.75", 57, digestive, false, "Digestive health");
        add("GastroCalm Daily", "CoreKind", "Demo botanical blend", "30 capsules", "Fictional demonstration wellness product. Not intended for diagnosis or treatment.", "14.40", 63, digestive, false, "Digestive health");
        add("DermaShield Lotion", "DermaShield", "Demo skin-care blend", "200 ml", "Fictional demonstration personal care product. For display and workflow testing.", "21.00", 39, skin, false, "Skin and personal care");
        add("DermaShield Cleanser", "DermaShield", "Demo skin-care blend", "150 ml", "Fictional demonstration personal care product. For display and workflow testing.", "13.80", 5, skin, false, "Skin and personal care");
        add("LunaBalance Daily", "LunaBalance", "Demo botanical blend", "30 tablets", "Fictional demonstration wellness product. Not intended for diagnosis or treatment.", "19.50", 42, womens, false, "Women's wellness");
        add("LunaBalance Comfort", "LunaBalance", "Demonstration formulation", "20 capsules", "Fictional prescription-only demo item for workflow demonstrations; not a real medicine.", "26.00", 18, womens, true, "Women's wellness");
        add("ForgeWell Active", "ForgeWell", "Demo nutrient blend", "30 sachets", "Fictional demonstration nutrition product. Not intended for diagnosis or treatment.", "17.25", 35, mens, false, "Men's wellness");
        add("ForgeWell Hydration", "ForgeWell", "Demo electrolyte blend", "12 sachets", "Fictional demonstration hydration product. Follow the product label.", "10.50", 76, mens, false, "Men's wellness");
        add("NutriBalance Daily", "NutriBalance", "Demo nutrient blend", "60 capsules", "Fictional demonstration nutrition product. Not intended for diagnosis or treatment.", "22.80", 91, immunity, false, "Immunity and nutrition");
        add("HydraCare Mineral", "HydraCare", "Demo mineral blend", "20 sachets", "Fictional demonstration hydration product. Follow the product label.", "11.60", 3, immunity, false, "Immunity and nutrition");
    }

    private Category category(String name, String description) {
        return categoryRepository.save(new Category(name, description));
    }

    private void add(String name, String brand, String composition, String dosage, String description,
                     String price, int stock, Category category, boolean requiresPrescription, String ailment) {
        Medicine medicine = new Medicine();
        medicine.setName(name);
        medicine.setBrand(brand);
        medicine.setComposition(composition);
        medicine.setDosage(dosage);
        medicine.setDescription(description);
        medicine.setPrice(new BigDecimal(price));
        medicine.setStockQuantity(stock);
        medicine.setCategory(category);
        medicine.setRequiresPrescription(requiresPrescription);
        medicine.setImageUrl(switch (category.getName()) {
            case "Daily Wellness" -> "/products/daily-wellness.svg";
            case "Respiratory Care" -> "/products/respiratory-care.svg";
            case "Digestive Health" -> "/products/digestive-health.svg";
            case "Skin & Personal Care" -> "/products/skin-personal-care.svg";
            case "Women's Wellness" -> "/products/womens-wellness.svg";
            case "Men's Wellness" -> "/products/mens-wellness.svg";
            default -> "/products/immunity-nutrition.svg";
        });
        medicine.setAilment(ailment);
        medicineRepository.save(medicine);
    }
}
