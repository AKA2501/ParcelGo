package com.parcelgo.user.repo;
import com.parcelgo.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
public interface UserRepo extends JpaRepository<User, Long> {}
