package com.pb.employee.request;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDownloadRequest {

    List<String> selectColumns;
}
