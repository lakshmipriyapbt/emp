package com.invoice.config;

import com.invoice.util.Constants;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Maps "/assets/img/**" URL path to the "D:/ems/ui/public/assets/img/" directory
        registry.addResourceHandler(Constants.IMAGE_PATH)
                .addResourceLocations(Constants.IMAGE_PATH_FILE);
    }
}
