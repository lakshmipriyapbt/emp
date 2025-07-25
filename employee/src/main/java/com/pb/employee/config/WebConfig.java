package com.pb.employee.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Maps "/assets/img/**" URL path to the "D:/ems/ui/public/assets/img/" directory
        registry.addResourceHandler("/home/ubuntu/ems_prod_imag_bkp/**")
                .addResourceLocations("file:/home/ubuntu/ems_prod_imag_bkp/");

    }
}
