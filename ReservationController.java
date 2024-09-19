package com.example.demo.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.DBConfig;
import com.example.demo.dao.ReservationDao;
import com.example.demo.model.ReservationAddModel;

@RestController
@RequestMapping("/api/ReservationAdd")
@CrossOrigin
public class ReservationController {

    @Autowired
    private ReservationDao reservationDao;
    @Autowired
	DBConfig DBConf;
	@Autowired
	JdbcTemplate jdbc;

	@RequestMapping("/getViewResData")
	public Map<String, Object> getViewRevUser(@RequestParam String user_id,
	                                           @RequestParam String comp_id
	                                         //  @RequestParam String reservation_id
	                                           ) {
	    Map<String, Object> datamap = new HashMap<>();
	    List<ReservationAddModel> dataList = new ArrayList<>();
	    String err_message = "";
	    String status_code = "";
	    try {
	        // DB接続先取得
	        JdbcTemplate jdbc = DBConf.jdbcTemplate(comp_id);
	        dataList = reservationDao.selectViewRevUser(jdbc, user_id);
	      //  dataList = reservationDao.selectViewRevUser(jdbc,user_id, reservation_id);
	        // 返送データを設定
	        if (!dataList.isEmpty()) {
	            err_message = "";
	            status_code = "200";
	        } else {
	            err_message = "Data not found";
	            status_code = "420";
	        }
	    } catch (DataAccessException e) {
	        e.printStackTrace();
	        err_message = "Database error";
	        status_code = "110";
	    } finally {
	        datamap.put("ResViewListData", dataList);
	        datamap.put("err_message", err_message);
	        datamap.put("status_code", status_code);
	    }  
	    
	    return datamap;
	}


	
	
//	
	@RequestMapping("/getViewRevArray")
	public Map<String,Object> getViewRevArray(@RequestParam("user_id") String user_id,
            @RequestParam("comp_id") String comp_id
          //  @RequestParam("seqno") Integer seqno
          //  @RequestParam(value = "seqno", required = false) Integer seqno
           ){ 
		
		
	  //  System.out.println("Tham số seqno: " + seqno);
       	    Map<String, Object> arraymap = new HashMap<>();
    	    List<ReservationAddModel> viewArrayList = new ArrayList<>();
    	    String err_message = "";
    	    String status_code = "";
    	    try {
    	        // DB接続先取得
    	        JdbcTemplate jdbc = DBConf.jdbcTemplate(comp_id);
    	        viewArrayList = reservationDao.selectViewRevArray(jdbc);//, seqno
    	        // 返送データを設定
    	        if (!viewArrayList.isEmpty()) {
    	            err_message = "";
    	            status_code = "200";
    	        } else {
    	            err_message = "Data not found";
    	            status_code = "420";
    	        }
    	    } catch (DataAccessException e) {
    	        e.printStackTrace();
    	        err_message = "Database error";
    	        status_code = "110";
    	    } finally {
    	    	arraymap.put("ResViewArrayData", viewArrayList);
    	    	arraymap.put("err_message", err_message);
    	    	arraymap.put("status_code", status_code);
    	    }  
    	    
    	    return arraymap;
	} 
   
}
