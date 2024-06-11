package com.pathbreaker.payslip.controller;

import com.pathbreaker.payslip.entity.Relieving;
import com.pathbreaker.payslip.request.RelievingRequest;
import com.pathbreaker.payslip.request.RelievingUpdateRequest;
import com.pathbreaker.payslip.response.RelievingReponse;
import com.pathbreaker.payslip.service.RelievingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@Slf4j
@CrossOrigin(origins="*")
@RequestMapping("/relieving")
public class RelievingController {

    @Autowired
    private RelievingService relievingService;

    @PostMapping("/add")
    public ResponseEntity<?> createRelieving(@RequestBody RelievingRequest relievingRequest){
        return relievingService.createRelieving(relievingRequest);
    }

    @GetMapping("/all")
    public List<RelievingReponse> getAllRelieving(){
        return relievingService.getAllRelieving();
    }

    @GetMapping("/{employeeId}")
    public Optional<RelievingReponse> getRelievingById(@PathVariable String employeeId){
        return relievingService.getRelievingById(employeeId);
    }

    @PutMapping("/{employeeId}")
    public ResponseEntity<?> updateById(@PathVariable String employeeId,@RequestBody RelievingUpdateRequest relievingRequest){
        return relievingService.updateById(employeeId,relievingRequest);
    }

    @DeleteMapping("/{employeeId}")
    public ResponseEntity<?> deleteById(@PathVariable String employeeId){
        return relievingService.deleteById(employeeId);
    }
}
