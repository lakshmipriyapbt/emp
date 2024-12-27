package com.invoice.repository;

import com.invoice.model.QuotationModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuotationRepository extends JpaRepository<QuotationModel,String> {
}
