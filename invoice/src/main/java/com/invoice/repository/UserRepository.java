package com.invoice.repository;

import com.invoice.model.UserModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserModel,String> {

    boolean existsByuserEmail(String userEmail);

    boolean existsByuserEmailAndUserIdNot(String newEmail, Long userId);
}
