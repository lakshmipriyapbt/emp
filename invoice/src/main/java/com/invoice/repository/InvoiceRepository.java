package com.invoice.repository;

import com.invoice.model.InvoiceModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<InvoiceModel, String> {
    List<InvoiceModel> findByCompanyId(String companyId);

    List<InvoiceModel> findAllByCustomerId(String customerId);

    List<InvoiceModel> findAllByCompanyId(String companyId);
}


