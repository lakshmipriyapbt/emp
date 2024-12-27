package com.invoice.repository;

import com.invoice.model.CompanyModel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<CompanyModel, Long> {

    boolean existsByCompanyName(String companyName);

    boolean existsByCompanyEmail(String companyEmail);

    boolean existsByGstNumber(String gstNumber);
}
