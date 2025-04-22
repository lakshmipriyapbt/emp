package com.pb.employee.opensearch;

import com.pb.employee.controller.filter.Filter;
import com.pb.employee.daoImpl.DocumentIndex;

import java.util.Arrays;
import java.util.Collection;

public final class ElasticSearchRequestBuilder {

    static ElasticSearchRequest build(Collection<Filter> filters,  DocumentIndex... documentIndices) {
        ElasticSearchRequest.Builder builder = new ElasticSearchRequest.Builder()
                .indices(Arrays.asList(documentIndices));
        filters
                .forEach(builder::filter);

        return builder.build();
    }
}
