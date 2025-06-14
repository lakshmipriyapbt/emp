package com.pb.employee.daoImpl;

import com.pb.employee.dao.ExperienceDao;
import com.pb.employee.persistance.model.ExperienceEntity;
import com.pb.employee.repository.Repository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ExperienceDaoImpl extends AbstractDao<ExperienceEntity>implements ExperienceDao {

    public ExperienceDaoImpl(Repository repository) {super(repository);}
}
