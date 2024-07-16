package com.pb.employee.opensearch;

import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.model.UserEntity;
import com.pb.employee.persistance.model.*;

import com.pb.employee.persistance.model.CompanyEntity;
import com.pb.employee.persistance.model.DepartmentEntity;
import com.pb.employee.persistance.model.DesignationEntity;
import com.pb.employee.persistance.model.EmployeeEntity;
import com.pb.employee.persistance.model.Entity;
import com.pb.employee.util.Constants;
import com.pb.employee.util.ResourceIdUtils;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.opensearch._types.Result;
import org.opensearch.client.opensearch._types.mapping.KeywordProperty;
import org.opensearch.client.opensearch._types.mapping.Property;
import org.opensearch.client.opensearch._types.mapping.TypeMapping;
import org.opensearch.client.opensearch._types.query_dsl.BoolQuery;
import org.opensearch.client.opensearch.core.*;
import org.opensearch.client.opensearch.core.search.Hit;
import org.opensearch.client.opensearch.indices.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;


import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Component
public class OpenSearchOperations {

    private static final Integer SIZE_ELASTIC_SEARCH_MAX_VAL = 9999;
    Logger logger = LoggerFactory.getLogger(OpenSearchOperations.class);


    @Autowired
    private OpenSearchClient esClient;

    public String createIndex(String name) throws EmployeeException {
        String index = ResourceIdUtils.generateCompanyIndex(name);
        TypeMapping mapping = new TypeMapping.Builder()
                .properties(Constants.RESOURCE_ID, new Property.Builder().keyword(new KeywordProperty.Builder().build()).build())
                .build();
        CreateIndexRequest createIndexRequest = new CreateIndexRequest.Builder()
                .index(index)
                .mappings(mapping)
                .build();
        try {
            logger.info("creating index {}", index);
            CreateIndexResponse result = esClient.indices().create(createIndexRequest);
            return result.index();
        } catch (Exception e) {
            logger.error("Not able to create index {} " , e.getMessage());
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_CREATE_COMPANY), index),
                    HttpStatus.CONFLICT);
        }
    }

    public Entity saveEntity(Entity entity, String Id, String index) throws EmployeeException {
        IndexResponse indexResponse = null;
        try {
            synchronized (entity){
                indexResponse = esClient.index(builder -> builder.index(index)
                        .id(Id)
                        .document(entity));
            }
            logger.debug("Saved the entity. Response {}.Entity:{}",indexResponse, entity);
        } catch (IOException e) {
            logger.error("Exception ",e);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_EMPLOYEE_ATTENDANCE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return entity;
    }


    public String deleteEntity(String id, String index) throws EmployeeException {
        logger.debug("Deleting the Entity {}", id);
        DeleteResponse deleteResponse = null;
        try {
            synchronized (id){
                deleteResponse = esClient.delete(b -> b.index(index)
                        .id(id));
            }
            if(deleteResponse.result() == Result.NotFound) {
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_EMPLOYEE), HttpStatus.NOT_FOUND);
            }
            logger.debug("Deleted the Entity {}, Delete response {}", id, deleteResponse);
        } catch (IOException e) {
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EXCEPTION_OCCURRED),HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return id;
    }

    public UserEntity getEMSAdminById(String user) throws IOException {
        GetRequest getRequest = new GetRequest.Builder().id(Constants.EMS_ADMIN+"_"+user)
                .index(Constants.INDEX_EMS).build();
        GetResponse<UserEntity> searchResponse = esClient.get(getRequest, UserEntity.class);
        if(searchResponse != null && searchResponse.source() != null){
            return searchResponse.source();
        }
        return null;
}

    public Object getById(String resourceId, String type, String index) throws IOException {
        if(type != null) {
            resourceId = type+"_"+resourceId;
        }
        GetRequest getRequest = new GetRequest.Builder().id(resourceId)
                .index(index).build();
        GetResponse<Object> searchResponse = esClient.get(getRequest, Object.class);
        if(searchResponse != null && searchResponse.source() != null){
            return searchResponse.source();
        }
        return null;
    }
    public AttendanceEntity getAttendanceById(String resourceId, String type, String index) throws IOException {
        logger.debug("Getting attendence by Id {} of index {}", resourceId, index);
        if(type != null) {
            resourceId = type+"_"+resourceId;
        }
        GetRequest getRequest = new GetRequest.Builder().id(resourceId)
                .index(index).build();
        GetResponse<AttendanceEntity> searchResponse = esClient.get(getRequest, AttendanceEntity.class);
        if(searchResponse != null && searchResponse.source() != null){
            return searchResponse.source();
        }
        return null;
    }


    public EmployeeEntity getEmployeeById(String resourceId, String type, String index) throws IOException {
        if(type != null) {
            resourceId = type+"_"+resourceId;
        }
        GetRequest getRequest = new GetRequest.Builder().id(resourceId)
                .index(index).build();
        GetResponse<EmployeeEntity> searchResponse = esClient.get(getRequest, EmployeeEntity.class);
        if(searchResponse != null && searchResponse.source() != null){
            return searchResponse.source();
        }
        return null;
    }
    public CompanyEntity getCompanyById(String resourceId, String type, String index) throws IOException {
        if(type != null) {
            resourceId = type+"_"+resourceId;
        }
        GetRequest getRequest = new GetRequest.Builder().id(resourceId)
                .index(index).build();
        GetResponse<CompanyEntity> searchResponse = esClient.get(getRequest, CompanyEntity.class);
        if(searchResponse != null && searchResponse.source() != null){
            return searchResponse.source();
        }
        return null;
    }
    public DepartmentEntity getDepartmentById(String resourceId, String type, String index) throws IOException {
        if(type != null) {
            resourceId = type+"_"+resourceId;
        }
        GetRequest getRequest = new GetRequest.Builder().id(resourceId)
                .index(index).build();

        GetResponse<DepartmentEntity> searchResponse = esClient.get(getRequest, DepartmentEntity.class);
        if(searchResponse != null && searchResponse.source() != null){
            return searchResponse.source();
        }
        return null;
    }

    public DesignationEntity getDesignationById(String resourceId, String type, String index) throws IOException {
        if(type != null) {
            resourceId = type+"_"+resourceId;
        }
        GetRequest getRequest = new GetRequest.Builder().id(resourceId)
                .index(index).build();
        GetResponse<DesignationEntity> searchResponse = esClient.get(getRequest, DesignationEntity.class);
        if(searchResponse != null && searchResponse.source() != null){
            return searchResponse.source();
        }
        return null;
    }
    public SalaryEntity getSalaryById(String resourceId, String type, String index) throws IOException {
        if(type != null) {
            resourceId = type+"_"+resourceId;
        }
        GetRequest getRequest = new GetRequest.Builder().id(resourceId)
                .index(index).build();
        GetResponse<SalaryEntity> searchResponse = esClient.get(getRequest, SalaryEntity.class);
        if(searchResponse != null && searchResponse.source() != null){
            return searchResponse.source();
        }
        return null;
    }
    public PayslipEntity getPayslipById(String resourceId, String type, String index) throws IOException {
        if(type != null) {
            resourceId = type+"_"+resourceId;
        }
        GetRequest getRequest = new GetRequest.Builder().id(resourceId)
                .index(index).build();
        GetResponse<PayslipEntity> searchResponse = esClient.get(getRequest, PayslipEntity.class);
        if(searchResponse != null && searchResponse.source() != null){
            return searchResponse.source();
        }
        return null;
    }


    public List<DesignationEntity> getCompanyDesignationByName(String companyName, String designationName) throws EmployeeException {
        logger.debug("Getting the Resource by id {} and :{}", companyName, designationName);
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        boolQueryBuilder = boolQueryBuilder
                .filter(q -> q.matchPhrase(t -> t.field(Constants.TYPE).query(Constants.DESIGNATION)));
        if(designationName != null) {
            boolQueryBuilder = boolQueryBuilder
                    .filter(q -> q.matchPhrase(t -> t.field(Constants.NAME).query(designationName)));
        }
        BoolQuery.Builder finalBoolQueryBuilder = boolQueryBuilder;
        SearchResponse<DesignationEntity> searchResponse = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        try {
            searchResponse = esClient.search(t -> t.index(index).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(finalBoolQueryBuilder.build().toQuery()), DesignationEntity.class);
        } catch (IOException e) {
            e.getStackTrace();
            logger.error(e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        List<Hit<DesignationEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of hits {}", hits.size());
        List<DesignationEntity> designationEntities = new ArrayList<>();
        if(hits.size() > 0) {
            for(Hit<DesignationEntity> hit : hits){
                designationEntities.add(hit.source());
            }
        }
        return designationEntities;
    }

    public List<CompanyEntity> getCompanyByData(String companyName, String type, String shortName) throws EmployeeException {
        logger.debug("Getting the Resource by name {}, {},{}", companyName, type, shortName);
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        boolQueryBuilder = boolQueryBuilder
                .filter(q -> q.matchPhrase(t -> t.field(Constants.TYPE).query(type)));
        if(companyName != null) {
            boolQueryBuilder = boolQueryBuilder
                    .filter(q -> q.matchPhrase(t -> t.field(Constants.COMPANY_NAME).query(companyName)));
        }
        if(shortName != null) {
            boolQueryBuilder = boolQueryBuilder
                    .filter(q -> q.matchPhrase(t -> t.field(Constants.SHORT_NAME).query(shortName)));
        }
        BoolQuery.Builder finalBoolQueryBuilder = boolQueryBuilder;
        SearchResponse<CompanyEntity> searchResponse = null;
        try {
            searchResponse = esClient.search(t -> t.index(Constants.INDEX_EMS).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(finalBoolQueryBuilder.build()._toQuery()), CompanyEntity.class);
        } catch (IOException e) {
            e.getStackTrace();
            logger.error(e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        List<Hit<CompanyEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of hits {}", hits.size());
        List<CompanyEntity> subscriberEntities = new ArrayList<>();
        if(hits.size() > 0) {
            for(Hit<CompanyEntity> hit : hits){
                subscriberEntities.add(hit.source());
            }
        }
        return subscriberEntities;
    }

    public List<EmployeeEntity> getCompanyEmployeeByData(String companyName, String empId, String emailId) throws EmployeeException {
        logger.debug("Getting the Resource by  , companyName{} empId,{},emailId {}", companyName, empId, emailId);
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        boolQueryBuilder = boolQueryBuilder
                .filter(q -> q.matchPhrase(t -> t.field(Constants.EMPLOYEE_ID).query(empId)));
        if(emailId != null) {
            boolQueryBuilder = boolQueryBuilder
                    .filter(q -> q.matchPhrase(t -> t.field(Constants.EMAIL_ID).query(emailId)));
        }
        BoolQuery.Builder finalBoolQueryBuilder = boolQueryBuilder;
        SearchResponse<EmployeeEntity> searchResponse = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        try {
            searchResponse = esClient.search(t -> t.index(index).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(finalBoolQueryBuilder.build()._toQuery()), EmployeeEntity.class);
        } catch (IOException e) {
            e.getStackTrace();
            logger.error(e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        List<Hit<EmployeeEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of hits {}", hits.size());
        List<EmployeeEntity> employeeEntities = new ArrayList<>();
        if(hits.size() > 0) {
            for(Hit<EmployeeEntity> hit : hits){
                employeeEntities.add(hit.source());
            }
        }
        return employeeEntities;
    }

    public List<DepartmentEntity> getCompanyDepartmentByName(String companyName, String departmentName) throws EmployeeException {
        logger.debug("Getting the Resource by id {} : {}", companyName, departmentName);
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        boolQueryBuilder = boolQueryBuilder
                .filter(q -> q.matchPhrase(t -> t.field(Constants.TYPE).query(Constants.DEPARTMENT)));
        if(departmentName != null) {
            boolQueryBuilder = boolQueryBuilder
                    .filter(q -> q.matchPhrase(t -> t.field(Constants.NAME).query(departmentName)));
        }
        BoolQuery.Builder finalBoolQueryBuilder = boolQueryBuilder;
        SearchResponse<DepartmentEntity> searchResponse = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        try {
            searchResponse = esClient.search(t -> t.index(index).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(finalBoolQueryBuilder.build()._toQuery()), DepartmentEntity.class);
        } catch (IOException e) {
            e.getStackTrace();
            logger.error(e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        List<Hit<DepartmentEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of hits {}", hits.size());
        List<DepartmentEntity> departmentEntities = new ArrayList<>();
        if(hits.size() > 0) {
            for(Hit<DepartmentEntity> hit : hits){
                departmentEntities.add(hit.source());
            }
        }
        return departmentEntities;
    }



    public List<CompanyEntity> getCompanies() throws EmployeeException {
        logger.debug("Getting all the companies ");
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        boolQueryBuilder = boolQueryBuilder
                .filter(q -> q.matchPhrase(t -> t.field(Constants.TYPE).query(Constants.COMPANY)));
        BoolQuery.Builder finalBoolQueryBuilder = boolQueryBuilder;
        SearchResponse<CompanyEntity> searchResponse = null;
        try {
            searchResponse = esClient.search(t -> t.index(Constants.INDEX_EMS).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(finalBoolQueryBuilder.build()._toQuery()), CompanyEntity.class);
        } catch (IOException e) {
            e.getStackTrace();
            logger.error(e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        List<Hit<CompanyEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of hits {}", hits.size());
        List<CompanyEntity> companyEntities = new ArrayList<>();
        if(hits.size() > 0) {
            for(Hit<CompanyEntity> hit : hits){
                companyEntities.add(hit.source());
            }
        }
        return companyEntities;
    }



    public SearchResponse<Object> searchByQuery(BoolQuery.Builder query, String index, Class targetClass) throws EmployeeException {
        SearchResponse searchResponse = null;
        try {
            searchResponse = esClient.search(t -> t.index(index).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(query.build()._toQuery()), targetClass.getClass());
        } catch (IOException e) {
            e.printStackTrace();
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.FAILED_TO_PROCESS), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return searchResponse;
    }


    public List<EmployeeEntity> getCompanyEmployees(String companyName) throws EmployeeException {
        logger.debug("Getting employees for company {}", companyName);
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        boolQueryBuilder = boolQueryBuilder
                .filter(q -> q.matchPhrase(t -> t.field(Constants.TYPE).query(Constants.EMPLOYEE)));
        BoolQuery.Builder finalBoolQueryBuilder = boolQueryBuilder;
        SearchResponse<EmployeeEntity> searchResponse = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);

        try {
            // Adjust the type or field according to your index structure
            searchResponse = esClient.search(t -> t.index(index).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(finalBoolQueryBuilder.build()._toQuery()), EmployeeEntity.class);
        } catch (IOException e) {
            logger.error(e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        List<Hit<EmployeeEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of employee hits for company {}: {}", companyName, hits.size());

        List<EmployeeEntity> employeeEntities = new ArrayList<>();
        for (Hit<EmployeeEntity> hit : hits) {
            employeeEntities.add(hit.source());
        }

        return employeeEntities;
    }
    public List<SalaryEntity> getSalaries(String companyName, String employeeId) throws EmployeeException{
        logger.debug("Getting employees for salary details {}", companyName);
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        boolQueryBuilder = boolQueryBuilder
                .filter(q -> q.matchPhrase(t -> t.field(Constants.TYPE).query(Constants.SALARY)))
                .filter(q -> q.matchPhrase(t -> t.field(Constants.EMPLOYEE_ID).query(employeeId)));
        BoolQuery.Builder finalBoolQueryBuilder = boolQueryBuilder;
        SearchResponse<SalaryEntity> searchResponse = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);

        try {
            // Adjust the type or field according to your index structure
            searchResponse = esClient.search(t -> t.index(index).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(finalBoolQueryBuilder.build().toQuery()), SalaryEntity.class);
        } catch (IOException e) {
            logger.error(e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        List<Hit<SalaryEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of employee hits for company is {}: {}", companyName, hits.size());

        List<SalaryEntity> salaryEntities = new ArrayList<>();
        for (Hit<SalaryEntity> hit : hits) {
            salaryEntities.add(hit.source());
        }

        return salaryEntities;
    }

    public List<PayslipEntity> getEmployeePayslip(String companyName, String employeeId,String month, String year) throws EmployeeException {
        logger.debug("Getting payslips for employee {} in company {}", employeeId, companyName);

        // Build the BoolQuery
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        boolQueryBuilder = boolQueryBuilder
                .filter(q -> q.matchPhrase(t -> t.field(Constants.TYPE).query(Constants.PAYSLIP)))
                .filter(q -> q.matchPhrase(t -> t.field(Constants.EMPLOYEE_ID).query(employeeId)));
        if(year!=null){
            boolQueryBuilder=boolQueryBuilder.filter(q -> q.matchPhrase(t -> t.field(Constants.YEAR).query(year)));
        }
           if(month!=null){
            boolQueryBuilder=boolQueryBuilder.filter(q -> q.matchPhrase(t -> t.field(Constants.MONTH).query(month)));
        }
        BoolQuery.Builder finalBoolQueryBuilder = boolQueryBuilder;
        SearchResponse<PayslipEntity> searchResponse = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);

        try {
            // Execute the search
            searchResponse = esClient.search(t -> t.index(index).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(finalBoolQueryBuilder.build()._toQuery()), PayslipEntity.class);
        } catch (IOException e) {
            logger.error("Error executing search query: {}", e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // Get hits from the search response
        List<Hit<PayslipEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of payslip hits for company {} and employee {}: {}", companyName, employeeId, hits.size());

        // Filter payslips for the specific employee ID
        List<PayslipEntity> payslipEntities = new ArrayList<>();
        for (Hit<PayslipEntity> hit : hits) {
            PayslipEntity payslip = hit.source();
                payslipEntities.add(payslip);
        }

        // Log if no payslips are found for the employee
        if (payslipEntities.isEmpty()) {
            logger.warn("No payslips found for employee {} in company {}", employeeId, companyName);
        }

        return payslipEntities;
    }
    public void deleteIndex(String index) throws EmployeeException {
        try {
            // Check if the index exists before attempting deletion
            DeleteIndexRequest deleteIndexRequest = new DeleteIndexRequest.Builder().index(index).build();
            DeleteIndexResponse deleteIndexResponse = esClient.indices().delete(deleteIndexRequest);

            if (!deleteIndexResponse.acknowledged()) {
                throw new EmployeeException("Failed to delete index " + index, HttpStatus.INTERNAL_SERVER_ERROR);
            }

            logger.debug("Index {} deleted successfully", index);
        } catch (IOException e) {
            logger.error("Exception while deleting index {}: {}", index, e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.FAILED_TO_DELETE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    public List<AttendanceEntity> getAttendanceByMonthAndYear(String companyName, String employeeId, String month, String year) throws EmployeeException {
        logger.debug("Getting attendance for employee {} for month {} and year {}", employeeId, month, year);
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();
        boolQueryBuilder = boolQueryBuilder
                .filter(q -> q.matchPhrase(t -> t.field(Constants.TYPE).query(Constants.ATTENDANCE)))
                .filter(q -> q.matchPhrase(t -> t.field(Constants.EMPLOYEE_ID).query(employeeId)));
        if(month!=null){
            boolQueryBuilder=boolQueryBuilder.filter(q -> q.matchPhrase(t -> t.field(Constants.MONTH).query(month)));
        }
        if(year!=null){
            boolQueryBuilder=boolQueryBuilder.filter(q -> q.matchPhrase(t -> t.field(Constants.YEAR).query(year)));
        }
        BoolQuery.Builder finalBoolQueryBuilder = boolQueryBuilder;
        SearchResponse<AttendanceEntity> searchResponse = null;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);

        try {
            searchResponse = esClient.search(t -> t.index(index).size(SIZE_ELASTIC_SEARCH_MAX_VAL)
                    .query(finalBoolQueryBuilder.build().toQuery()), AttendanceEntity.class);
        } catch (IOException e) {
            logger.error(e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        List<Hit<AttendanceEntity>> hits = searchResponse.hits().hits();
        logger.info("Number of attendance hits for employee {}: {}", employeeId, hits.size());

        List<AttendanceEntity> attendanceEntities = new ArrayList<>();

        for (Hit<AttendanceEntity> hit : hits) {
            attendanceEntities.add(hit.source());
        }
        return attendanceEntities;
    }

}