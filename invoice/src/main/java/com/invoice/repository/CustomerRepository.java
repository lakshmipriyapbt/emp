package com.invoice.repository;

import com.invoice.model.CustomerModel;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<CustomerModel, String> {

    List<CustomerModel> findByCompanyId(String companyId);

    Optional<CustomerModel> findByCustomerNameAndCompanyId(String encodedCustomerName, String companyId);
}
