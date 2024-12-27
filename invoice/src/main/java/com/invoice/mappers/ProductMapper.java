package com.invoice.mappers;

import com.invoice.model.ProductModel;
import com.invoice.util.Constants;
import org.mapstruct.Mapper;
import java.util.HashMap;
import java.util.Map;

@Mapper(componentModel = "spring")
public interface ProductMapper {


    default Map<String, Object> toResponseMap(ProductModel productModel) {
        if (productModel == null) {
            return null;
        }

        Map<String, Object> response = new HashMap<>();
        response.put(Constants.PRODUCT_ID, productModel.getProductId());
        response.put(Constants.PRODUCT_NAME, productModel.getProductName());
        response.put(Constants.SERVICE,productModel.getService());
        response.put(Constants.COST, productModel.getProductCost());
        response.put(Constants.HSN_NO, productModel.getHsnNo());
        response.put(Constants.GST, productModel.getGst());
        response.put(Constants.UNIT_COST, productModel.getUnitCost());

        return response;
    }
}
