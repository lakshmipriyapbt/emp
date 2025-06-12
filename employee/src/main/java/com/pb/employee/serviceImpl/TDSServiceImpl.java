package com.pb.employee.serviceImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.dao.TDSDao;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.model.ResourceType;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.CompanyEntity;
import com.pb.employee.persistance.model.TDSEntity;
import com.pb.employee.request.TDSPayload.TDSCreatePayload;
import com.pb.employee.request.TDSPayload.TDSResPayload;
import com.pb.employee.request.TDSPayload.TDSUpdatePayload;
import com.pb.employee.service.TDSService;
import com.pb.employee.util.Constants;
import com.pb.employee.util.ResourceIdUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class TDSServiceImpl implements TDSService {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TDSDao dao;

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Override
    public ResponseEntity<?> createCompanyTDS(String companyName, TDSCreatePayload createPayload)
            throws EmployeeException {
        try {
            String resourceId = ResourceIdUtils.generateCompanyTDSId(companyName, createPayload.getStartYear(), createPayload.getEndYear(), createPayload.getTdsType());
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null){
                log.error("Exception while fetching the company calendar details");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            Collection<TDSResPayload> tds = this.getCompanyTDS(companyName, resourceId, null);
            if (!tds.isEmpty()){
                log.error("Company tds details is already exist");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_TDS_ALREADY_EXIST), HttpStatus.FORBIDDEN);
            }
            TDSEntity tdsResPayload = objectMapper.convertValue(createPayload, TDSEntity.class);
            tdsResPayload.setId(resourceId);
            tdsResPayload.setCompanyId(companyEntity.getId());
            tdsResPayload.setType(ResourceType.COMPANY_TDS.value());
            dao.save(tdsResPayload, companyName);
        }catch (EmployeeException e){
            log.error("Exception while adding the company TDS details of the Year: {}", createPayload.getStartYear());
            throw e;
        } catch (Exception e) {
            log.error("Exception while adding the companyTDS details");
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_ADD_COMPANY_TDS), createPayload.getStartYear()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED
        );
    }

    @Override
    public Collection<TDSResPayload> getCompanyTDS(String companyName, String id, String tdsType)
            throws EmployeeException {
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null){
                log.error("Exception while fetching the company");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            log.debug("Getting Company TDS by companyName: {}", companyName);
            Collection<TDSEntity> tds = dao.getCompanyTDS(companyName, id, null, tdsType, companyEntity.getId());
            Collection<TDSResPayload> tdsResPayloadCollections = tds.stream()
                    .map(entity -> objectMapper.convertValue(entity, TDSResPayload.class))
                    .collect(Collectors.toList());
            return tdsResPayloadCollections;
        } catch (Exception e) {
            log.error("Exception while fetching the company TDS details");
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_COMPANY_TDS), e), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> updateCompanyTDS(String companyName, String id, TDSUpdatePayload updatePayload)
            throws EmployeeException {
        try {
            log.debug("validating id {}  existence ", id);
            TDSEntity tds= null;
            try {
                CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
                if (companyEntity == null){
                    log.error("Exception while fetching the company calendar details");
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
                }
                Collection<TDSResPayload> companyTDSEntities = this.getCompanyTDS(companyName, id, null);
                if (Objects.isNull(companyTDSEntities) || companyTDSEntities.isEmpty()) {
                    log.error("Company TDS does not existed for id {}", id);
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_TDS_NOT_FOUND), HttpStatus.NOT_FOUND);
                }

                tds = dao.get(companyTDSEntities.stream().findFirst().get().getId(), companyName).orElseThrow();
            } catch (EmployeeException e) {
                log.error("Unable to get the company calendar for id {}", id);
                throw e;
            }

            try {
                TDSEntity tdsSrc = objectMapper.convertValue(updatePayload, TDSEntity.class);
                BeanUtils.copyProperties(tdsSrc, tds, getNullPropertyNames(tdsSrc));
                dao.save(tds, companyName);
            } catch (Exception exception) {
                log.error("Unable to update the company tds details for id {} with the reason of {}", id, exception.getMessage());
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_UPDATE_COMPANY_TDS), HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (Exception e) {
            throw new EmployeeException(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }

    @Override
    public void deleteCompanyTDS(String companyName, String id) throws EmployeeException {
        log.debug("validating id: {}  existed ", companyName);
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null){
                log.error("Exception while fetching the company details");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            Collection<TDSResPayload> tdsResPayloads = this.getCompanyTDS(companyName, id, null);
            if (Objects.isNull(tdsResPayloads) || tdsResPayloads.isEmpty()) {
                log.error("Company tds not existed for id: {}", id);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_TDS_NOT_FOUND), id),
                        HttpStatus.BAD_REQUEST);
            }
            dao.delete(id, companyName);
            log.info("The company tds with id: {} got deleted successfully", id);
        } catch (EmployeeException e) {
            throw new EmployeeException(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public TDSResPayload getCompanyYearTDS(String companyName, String year, String tdsType)
            throws EmployeeException {
         TDSResPayload tdsResPayload;
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null){
                log.error("Exception while fetching the company");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            log.debug("Getting Company TDS by companyName: {}, year: {}", companyName, year);
            Collection<TDSEntity> tds = dao.getCompanyTDS(companyName, null, year, tdsType, companyEntity.getId());

            tdsResPayload = objectMapper.convertValue(dao.get(tds.stream().findFirst().get().getId(), companyName).orElseThrow(), TDSResPayload.class);
        } catch (Exception e) {
            log.error("Exception while fetching the company TDS details");
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_COMPANY_TDS), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return tdsResPayload;
    }

    private String[] getNullPropertyNames(Object source) {
        final BeanWrapper src = new BeanWrapperImpl(source);
        Set<String> emptyNames = new HashSet<>();
        for (var pd : src.getPropertyDescriptors()) {
            Object value = src.getPropertyValue(pd.getName());
            if (value == null) {
                emptyNames.add(pd.getName());
            }
        }
        return emptyNames.toArray(new String[0]);
    }

}

