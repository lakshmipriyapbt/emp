package com.pb.employee.opensearch;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.ElasticsearchException;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import com.pb.employee.daoImpl.DocumentIndex;
import com.pb.employee.daoImpl.DocumentType;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.persistance.model.IDEntity;
import com.pb.employee.repository.Repository;

import java.io.IOException;
import java.util.Collection;
import java.util.Optional;

public abstract class ElasticSearchRestClient implements Repository {

    // Search and return the first matching result
    final <T extends IDEntity> Optional<T> searchAndGet(ElasticSearchRequest searchRequest, Class<T> documentClass, ElasticsearchClient esClient)
            throws EmployeeException {
        return search(searchRequest, documentClass, esClient).stream()
                .findFirst();
    }

    // Perform a search and return a collection of results
    final <T extends IDEntity> Collection<T> search(ElasticSearchRequest searchRequest, Class<T> documentClass, ElasticsearchClient esClient)
            throws EmployeeException {
        try {
            SearchRequest request = ElasticSearchUtil.buildSearchRequest(searchRequest);
            SearchResponse<T> searchResponse = esClient.search(request, documentClass);
            return ElasticSearchUtil.toDocuments(searchResponse);
        } catch (IOException | ElasticsearchException e) {
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SEARCH), e);
        }
    }

    // Get the appropriate DocumentIndex based on the entity class and company name
    final <T extends IDEntity> DocumentIndex getIndex(Class<T> documentClass, String companyName) {
        // Get the base DocumentIndex based on the entity class (static index lookup)
        DocumentIndex documentIndex = DocumentIndex.getByName(documentClass.getSimpleName());

        // If the index is EMS and company name is provided, get the full index name
        if (companyName != null && !companyName.isEmpty()) {
            return DocumentIndex.getCompanyIndex(companyName);  // Retrieve dynamic index by company name
        }

        return documentIndex;  // Return the predefined or dynamically created index
    }

    // Get the appropriate DocumentType based on the entity class
    final <T extends IDEntity> DocumentType getType(Class<T> documentClass) {
        return DocumentType.getByType(documentClass);  // Retrieve the DocumentType based on class
    }
}
