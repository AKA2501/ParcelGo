package com.parcelgo.user.web;

import com.parcelgo.user.domain.User;
import com.parcelgo.user.repo.UserRepo;
import com.parcelgo.user.web.dto.UserCreateRequest;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {
  private final UserRepo repo;
  public UserController(UserRepo repo) { this.repo = repo; }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public User create(@Valid @RequestBody UserCreateRequest req){
    User u = new User();
    u.setName(req.getName());
    u.setEmail(req.getEmail());
    u.setPhone(req.getPhone());
    u.setAddressLine1(req.getAddressLine1());
    u.setAddressLine2(req.getAddressLine2());
    u.setCity(req.getCity());
    u.setState(req.getState());
    u.setPostalCode(req.getPostalCode());
    u.setCountry(req.getCountry());
    u.setHomeLat(req.getHomeLat() == null ? null : java.math.BigDecimal.valueOf(req.getHomeLat()));
    u.setHomeLng(req.getHomeLng() == null ? null : java.math.BigDecimal.valueOf(req.getHomeLng()));
   u.setDefaultPaymentMethod(req.getDefaultPaymentMethod());
    try {
      return repo.save(u);
    } catch (DataIntegrityViolationException e) {
      // likely unique email/phone violation
      throw new IllegalArgumentException("Email or phone already exists");
    }
  }

  @GetMapping("/{id}")
  public User get(@PathVariable Long id){ return repo.findById(id).orElseThrow(); }

  @GetMapping
  public List<User> list(){ return repo.findAll(); }
}
