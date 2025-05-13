package com.pb.employee.opensearch;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.ElasticsearchException;
import co.elastic.clients.elasticsearch._types.Result;
import co.elastic.clients.elasticsearch.core.*;
import com.pb.employee.controller.filter.Filter;
import com.pb.employee.controller.filter.Operator;
import com.pb.employee.daoImpl.DocumentType;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.persistance.model.IDEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.*;

@Component
public class ElasticSearchRestClientImpl extends ElasticSearchRestClient {

    private static final Logger logger = LoggerFactory.getLogger(ElasticSearchRestClientImpl.class);

    @Autowired
    private ElasticsearchClient esClient;

    @Override
    public <T extends IDEntity> Optional<T> get(String id, Class<T> documentClass, String companyName)
            throws EmployeeException {
        GetRequest getRequest = new GetRequest.Builder().id(id)
                .index(getIndex(documentClass, companyName).getName()).build();
        try {
            GetResponse<T> response = esClient.get(getRequest, documentClass);
            return Optional.ofNullable(ElasticSearchUtil.toDocument(response));
        } catch (IOException | ElasticsearchException e) {
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), e);
        }
    }

    @Override
    public <T extends IDEntity> Collection<T> search(Collection<Filter> filters, Class<T> documentClass,  String companyName) throws EmployeeException, EmployeeException {
        if(Objects.isNull(filters)) {
            filters = new ArrayList<>();
        }

        ElasticSearchRequest searchRequest = ElasticSearchRequestBuilder.build(filters, getIndex(documentClass, companyName));
        return search(searchRequest, documentClass, esClient);
    }

    @Override
    public <T extends IDEntity> Collection<T> getAll(Class<T> documentClass, String companyName) throws EmployeeException {
        return search(List.of(new Filter("type", Operator.EQ, DocumentType.getByType(documentClass).getType())), documentClass, companyName);
    }

    @Override
    public <T extends IDEntity> T save(T entity, String companyName)
            throws EmployeeException {
        logger.debug("Saving the Entity {}", entity.getId());
        try {
            synchronized (entity) {
                IndexResponse indexResponse = esClient.index(builder -> builder.index(getIndex(entity.getClass(), companyName).getName())
                        .id(entity.getId())
                        .document(entity));
                logger.debug("Saved the entity. Response {}. Entity:{}", indexResponse, entity);
            }
        } catch (IOException e) {
            logger.error(e.getMessage(), e);
            throw new EmployeeException(String.format("Unable to save the entity {} ",
                    entity.toString()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return entity;
    }

    @Override
    public <T extends IDEntity> T update(T entity, String companyName)
            throws EmployeeException {
        IndexRequest<T> request = new IndexRequest.Builder<T>()
                                                    .index(getIndex(entity.getClass(), companyName).getName())
                                                    .id(entity.getId())
                                                    .document(entity)
                                                    .build();

        try {
            IndexResponse response = esClient.index(request);
            if (response.result() != Result.Updated && response.result() != Result.Created) {
                throw new RuntimeException();
            }
        } catch (IOException | RuntimeException e) {
            throw new EmployeeException("Failed to update employee: " + entity.getId(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return entity;
    }

    @Override
    public <T extends IDEntity> void delete(String id, Class<T> documentClass, String companyName)
            throws EmployeeException {
        logger.debug("Deleting the Entity {}", id);
        try {
            synchronized (id) {
                DeleteResponse deleteResponse = esClient.delete(b -> b.index(getIndex(documentClass, companyName).getName())
                        .id(id));
                if(deleteResponse.result() == Result.NotFound) {
                    throw new EmployeeException(String.format("Entity id {} not found", id), HttpStatus.NOT_FOUND);
                }
                logger.debug("Deleted the Entity {}, Delete response {}", id, deleteResponse);
            }
        } catch (IOException e) {
            logger.error(e.getMessage(), e);
            throw new EmployeeException("Exception while deleting Entity " + id, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
