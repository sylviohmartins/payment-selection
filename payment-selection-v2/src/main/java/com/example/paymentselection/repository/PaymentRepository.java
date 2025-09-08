package com.example.paymentselection.repository;

import com.example.paymentselection.entity.Payment;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long>, JpaSpecificationExecutor<Payment> {

  // (opcionais, você pode manter)
  Page<Payment> findByStatus(String status, Pageable pageable);
  Page<Payment> findByVencimentoLessThanEqual(LocalDate vencimento, Pageable pageable);
  Page<Payment> findByStatusAndVencimentoLessThanEqual(String status, LocalDate vencimento, Pageable pageable);

  // --------- BULK PAY (status -> PAID) ---------

  @Modifying
  @Query("""
    update Payment p
       set p.status = 'PAID', p.updatedAt = CURRENT_TIMESTAMP
     where (:status is null or p.status = :status)
       and (:vencimentoAte is null or p.vencimento <= :vencimentoAte)
  """)
  void bulkUpdateByFilter(@Param("status") String status,
      @Param("vencimentoAte") LocalDate vencimentoAte);

  @Modifying
  @Query("""
    update Payment p
       set p.status = 'PAID', p.updatedAt = CURRENT_TIMESTAMP
     where (:status is null or p.status = :status)
       and (:vencimentoAte is null or p.vencimento <= :vencimentoAte)
       and p.id not in :excludedIds
  """)
  int bulkUpdateByFilterExcluding(@Param("status") String status,
      @Param("vencimentoAte") LocalDate vencimentoAte,
      @Param("excludedIds") List<Long> excludedIds);

  @Modifying
  @Query("""
    update Payment p
       set p.status = 'PAID', p.updatedAt = CURRENT_TIMESTAMP
     where p.id in :ids and p.status = 'A_PAGAR'
  """)
  void bulkUpdateByIds(@Param("ids") List<Long> ids);

  // --------- BULK CANCEL (status -> CANCELLED) ---------

  @Modifying
  @Query("""
    update Payment p
       set p.status = 'CANCELLED', p.updatedAt = CURRENT_TIMESTAMP
     where (:vencimentoAte is null or p.vencimento <= :vencimentoAte)
       and p.status = 'A_PAGAR'
  """)
  void bulkCancelByFilter(@Param("vencimentoAte") LocalDate vencimentoAte);

  @Modifying
  @Query("""
    update Payment p
       set p.status = 'CANCELLED', p.updatedAt = CURRENT_TIMESTAMP
     where (:vencimentoAte is null or p.vencimento <= :vencimentoAte)
       and p.status = 'A_PAGAR'
       and p.id not in :excludedIds
  """)
  int bulkCancelByFilterExcluding(@Param("vencimentoAte") LocalDate vencimentoAte,
      @Param("excludedIds") List<Long> excludedIds);

  @Modifying
  @Query("""
    update Payment p
       set p.status = 'CANCELLED', p.updatedAt = CURRENT_TIMESTAMP
     where p.id in :ids and p.status = 'A_PAGAR'
  """)
  int bulkCancelByIds(@Param("ids") List<Long> ids);
}
