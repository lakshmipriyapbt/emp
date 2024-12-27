package com.invoice.repository;

import com.invoice.model.CustomerModel;
import com.invoice.model.InvoiceModel;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<InvoiceModel, String> {
}


