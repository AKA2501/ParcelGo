package com.parcelgo.user.repo;

import com.parcelgo.user.domain.DriverSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DriverScheduleRepo extends JpaRepository<DriverSchedule, Long> {
    List<DriverSchedule> findByDriverId(Long driverId);
    void deleteByDriverId(Long driverId);
}
