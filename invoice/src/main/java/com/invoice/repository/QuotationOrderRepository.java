package com.invoice.repository;

import com.invoice.model.QuotationOrderModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuotationOrderRepository extends JpaRepository<QuotationOrderModel,String> {
}
