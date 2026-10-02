package com.example.epharmacy.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${upload.directory:uploads/prescriptions}")
    private String uploadDirectory;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDirectory).toAbsolutePath().normalize();
        String uploadUri = uploadPath.toUri().toString();

        registry.addResourceHandler("/uploads/prescriptions/**")
                .addResourceLocations(uploadUri.endsWith("/") ? uploadUri : uploadUri + "/");
    }
}
