package com.parcelgo.user.service;

import com.parcelgo.user.domain.AddressComponent;
import com.parcelgo.user.domain.Driver;
import com.parcelgo.user.domain.DriverSchedule;
import com.parcelgo.user.repo.DriverRepo;
import com.parcelgo.user.repo.DriverScheduleRepo;
import com.parcelgo.user.web.dto.DriverCreateRequest;
import com.parcelgo.user.web.dto.DriverResponse;
import com.parcelgo.user.web.dto.DriverSummaryResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.springframework.http.HttpStatus.*;

@Service
public class DriverService {

    private final DriverRepo driverRepo;
    private final DriverScheduleRepo scheduleRepo;

    public DriverService(DriverRepo driverRepo, DriverScheduleRepo scheduleRepo) {
        this.driverRepo = driverRepo;
        this.scheduleRepo = scheduleRepo;
    }

    @Transactional
    public DriverResponse create(DriverCreateRequest req) {
        // Unique email (optional; adjust per policy)
        if (driverRepo.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(CONFLICT, "email already exists");
        }

        Driver d = new Driver();
        d.setName(req.getName().trim());
        d.setEmail(req.getEmail().trim().toLowerCase());
        d.setPhone(Optional.ofNullable(req.getPhone()).map(String::trim).orElse(null));
        d.setVehicleRegistration(Optional.ofNullable(req.getVehicleRegistration()).map(String::trim).orElse(null));
        d.setMaxWeightKg(req.getMaxWeightKg());

        d.setStartAddress(toAddress(req.getStartAddress()));
        d.setEndAddress(toAddress(req.getEndAddress()));

        System.out.println("Driver entity before save: " + d);


        d = driverRepo.save(d);

        // schedule rows
       var s = req.getSchedule() ;
  DriverSchedule row = new DriverSchedule();
  row.setDriver(d);
  row.setDayOfWeek(s.getDay());
  row.setStartTime(parseOrNull(s.getStart()));
  row.setEndTime(parseOrNull(s.getEnd()));

        scheduleRepo.save(row);

        return toResponse(d, row);
    }

    @Transactional(readOnly = true)
    public List<DriverSummaryResponse> list() {
        List<Driver> all = driverRepo.findAll();
        List<DriverSummaryResponse> out = new ArrayList<>();
        for (Driver d : all) {
            DriverSummaryResponse s = new DriverSummaryResponse();
            s.setId(d.getId());
            s.setName(d.getName());
            s.setEmail(d.getEmail());
            s.setPhone(d.getPhone());
            s.setVehicleRegistration(d.getVehicleRegistration());
            s.setMaxWeightKg(d.getMaxWeightKg());
            s.setStartCity(d.getStartAddress() != null ? d.getStartAddress().getCity() : null);
            s.setEndCity(d.getEndAddress() != null ? d.getEndAddress().getCity() : null);
            out.add(s);
        }
        return out;
    }

    @Transactional(readOnly = true)
    public DriverResponse get(Long id) {
        Driver d = driverRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "driver not found"));
        DriverSchedule rows = scheduleRepo.findByDriverId(id);
        return toResponse(d, rows);
    }

    // ---- helpers ----
    private static AddressComponent toAddress(DriverCreateRequest.AddressDto a) {
        if (a == null) return null;
        AddressComponent c = new AddressComponent();
        c.setAddressLine1(a.getAddressLine1());
        c.setAddressLine2(a.getAddressLine2());
        c.setCity(a.getCity());
        c.setState(a.getState());
        c.setPostalCode(a.getPostalCode());
        c.setCountry(a.getCountry());
        c.setLat(a.getLat());
        c.setLng(a.getLng());
        return c;
    }

    private static LocalTime parseOrNull(String t) {
        if (t == null || t.isBlank()) return null;
        return LocalTime.parse(t);
    }

    private static DriverResponse toResponse(Driver d, DriverSchedule row) {
        DriverResponse out = new DriverResponse();
        out.setId(d.getId());
        out.setName(d.getName());
        out.setEmail(d.getEmail());
        out.setPhone(d.getPhone());
        out.setVehicleRegistration(d.getVehicleRegistration());
        out.setMaxWeightKg(d.getMaxWeightKg());

        DriverResponse.AddressDto sa = new DriverResponse.AddressDto();
        if (d.getStartAddress() != null) {
            sa.addressLine1 = d.getStartAddress().getAddressLine1();
            sa.addressLine2 = d.getStartAddress().getAddressLine2();
            sa.city = d.getStartAddress().getCity();
            sa.state = d.getStartAddress().getState();
            sa.postalCode = d.getStartAddress().getPostalCode();
            sa.country = d.getStartAddress().getCountry();
            sa.lat = d.getStartAddress().getLat();
            sa.lng = d.getStartAddress().getLng();
        }
        out.setStartAddress(sa);

        DriverResponse.AddressDto ea = new DriverResponse.AddressDto();
        if (d.getEndAddress() != null) {
            ea.addressLine1 = d.getEndAddress().getAddressLine1();
            ea.addressLine2 = d.getEndAddress().getAddressLine2();
            ea.city = d.getEndAddress().getCity();
            ea.state = d.getEndAddress().getState();
            ea.postalCode = d.getEndAddress().getPostalCode();
            ea.country = d.getEndAddress().getCountry();
            ea.lat = d.getEndAddress().getLat();
            ea.lng = d.getEndAddress().getLng();
        }
        out.setEndAddress(ea);


            DriverResponse.DayScheduleDto ds = new DriverResponse.DayScheduleDto();
            ds.day = row.getDayOfWeek();
            ds.start = row.getStartTime() != null ? row.getStartTime().toString() : null;
            ds.end = row.getEndTime() != null ? row.getEndTime().toString() : null;

        out.setSchedule(ds);
        return out;
    }
}
