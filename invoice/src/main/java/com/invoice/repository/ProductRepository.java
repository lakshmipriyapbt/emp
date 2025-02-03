package com.invoice.repository;

import com.invoice.model.ProductModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<ProductModel, String> {

    Optional<ProductModel> findByCompanyIdAndProductId(String companyId, String productId);

    List<ProductModel> findByCompanyId(String companyId);

    boolean existsByCompanyIdAndProductId(String companyId, String productId);

    void deleteByCompanyIdAndProductId(String companyId, String productId);
}