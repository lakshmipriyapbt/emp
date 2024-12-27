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

    @Query("SELECT c FROM CustomerModel c WHERE c.customerName = :customerName")
    Optional<CustomerModel> findByCustomerName(@Param("customerName") String customerName);

    boolean existsByEmail(String email);

    boolean existsByMobileNumber(String mobileNumber);

    boolean existsByGstNo(String gstNo);

}
