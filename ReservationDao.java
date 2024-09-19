package com.example.demo.dao;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.example.demo.model.ReservationAddModel;

@Repository("ReservationDao")
public class ReservationDao{
	
	//日付フォーマット設定(LocalDateTime→String(yyyy-mm-dd))
		DateTimeFormatter Dateformatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");

		
		/*
		 * 表示するための内容取得
		 * 予約A内容取得(表示用)
		 * */
	
	// 単体取得(
	public List<ReservationAddModel> selectViewRevUser(JdbcTemplate jdbc,
			 String user_id
			//String reservation_id
			 ) throws DataAccessException {	
		
//		 String sql = "SELECT "
//		 		+ "RS.SEQNO, "
//		 		+ "RS.RESERVATION_ID, "
//		 		+ "RS.RESERVATION_NAME, "
//		 		+ "RS.RESERVE_CONDITION, "
//		 		+ "RS.CANCEL_POLICY, "
//		 		+ "RS.SET_UNIT, "
//		 		+"D.DATESTR, " 
//		 		+"D.DATEEND, " 		 		 
//		 		+ "D.RESERVSTR, "
//		 		+ "D.RESERVEND, "
//		 		+ "RS.TIME_STR, "
//		 		+ "RS.TIME_END, "
//		 		+ "RS.RECEPTION_STR, "
//                 + "RT.TYPE_GROUP_NAME, "
//                 + "RC.RESERVE_COURSE, "
//                 + "RT.TYPE_NAME "
//                 + "FROM M_RESERVATION_A RS "
//                 + "JOIN T_RESERVATIONUSER D  "
//                 + "ON RS.RESERVATION_ID = D.RESERVATION_ID "
//                 + "JOIN T_RESERVATIONCOURSE_A RC "
//                 + "ON RS.RESERVATION_ID = RC.RESERVATION_ID "
//                 + "JOIN T_RESERVATIONSUB_A RT "
//                 + "ON RS.RESERVATION_ID = RT.RESERVATION_ID "
//                 + "WHERE RT.TYPE_GROUP = 1 "
//              //   + "AND RS.RESERVATION_ID = ?"
//              	 + "AND D.RESERVE_COURSE = RC.SEQNO " 
//                 + "AND RS.INP_PERSON = ? ";
		
		
		
		 String sql = "SELECT \n"
		 		+ "    A.RESERVATION_NAME ,\n"
		 		+ "    A.RESERVE_CONDITION ,\n"
		 		+ "    A.CANCEL_POLICY,\n"
		 		+ "    A.TIME_STR ,\n"
		 		+ "    A.TIME_END,\n"
		 		+ "    A.RECEPTION_STR ,\n"
		 		+ "    C.RESERVE_COURSE,\n"
		 		+ "    S.TYPE_GROUP_NAME,\n"
		 		+ "    S.TYPE_NAME\n"
		 		+ "FROM \n"
		 		+ "    M_RESERVATION_A A\n"
		 		+ "JOIN \n"
		 		+ "    T_RESERVATIONCOURSE_A C ON A.RESERVATION_ID = C.RESERVATION_ID\n"
		 		+ "JOIN \n"
		 		+ "    T_RESERVATIONSUB_A S ON A.RESERVATION_ID = S.RESERVATION_ID\n"
		 	//	+ "JOIN "
		 	//	+ "		T_RESERVATIONUSER D ON A.RESERVATION_ID = D.RESERVATION_ID "
		 		+ "WHERE \n"
		 	//	+ "    A.RESERVATION_ID = ?\n"
		 		+ "     A.INP_PERSON = ? "
		 		+ "    AND S.TYPE_GROUP = 1 ";
                 

		
		List<Map<String, Object>> dataList = jdbc.queryForList(sql,user_id);
		// List<Map<String, Object>> dataList = jdbc.queryForList(sql,user_id,reservation_id);
		
	    List<ReservationAddModel> modelList = new ArrayList<>();
	    for (Map<String, Object> data : dataList) {
	    	
	    	ReservationAddModel model = setReservationData(data);
	        modelList.add(model);
	    }
	    	  
	    return modelList;
	}	
	
	//ReservationDataの値、戻り値としてリストを返す
	private ReservationAddModel setReservationData(Map<String, Object> map) {
	    ReservationAddModel model = new ReservationAddModel();
		//戻り値としてリストを返す		
	    
	  //	SEQNO のデータ型を確認し、必要に応じて整数に変換
	    Object seqnoObj = map.get("SEQNO");
	    if (seqnoObj instanceof Integer) {
	        model.setSEQNO((Integer) seqnoObj);
	    } else if (seqnoObj instanceof String) {
	        try {
	            model.setSEQNO(Integer.parseInt((String) seqnoObj));
	        } catch (NumberFormatException e) {
	            // 値を整数に変換できない場合の処理
	            model.setSEQNO(null);
	        }
	    } else {
	        //必要に応じて他のケースにも対応
	        model.setSEQNO(null);
	    }	         	    	    
	    
	    model.setRESERVATION_ID((String)map.get("RESERVATION_ID"));
	    model.setRESERVATION_NAME((String) map.get("RESERVATION_NAME"));
	    model.setRESERVE_CONDITION((String) map.get("RESERVE_CONDITION"));	
	    model.setCANCEL_POLICY((String) map.get("CANCEL_POLICY"));  
	    model.setSET_UNIT((Integer) map.get("SET_UNIT"));  
	    model.setTIME_STR((String) map.get("TIME_STR"));	
	    model.setTIME_END((String) map.get("TIME_END"));	
	    model.setRECEPTION_STR((Integer) map.get("RECEPTION_STR"));	
	    model.setTYPE_GROUP_NAME((String) map.get("TYPE_GROUP_NAME"));		    
	    model.setRESERVE_COURSE((String) map.get("RESERVE_COURSE"));	
	    model.setTYPE_NAME((String) map.get("TYPE_NAME"));	
	    model.setINP_PERSON((String) map.get("INP_PERSON"));
	    if(Objects.nonNull(map.get("RESERVSTR")))
			model.setRESERVSTR(map.get("RESERVSTR").toString());
	    
	    if(Objects.nonNull(map.get("RESERVEND")))
			model.setRESERVEND(map.get("RESERVEND").toString());
	    if(Objects.nonNull(map.get("DATESTR")))
			model.setDATESTR(map.get("DATESTR").toString());
	    
	    if(Objects.nonNull(map.get("DATEEND")))
			model.setDATEEND(map.get("DATEEND").toString());
	    
	    
        return model;
	
		
	}
	
	
	
	/*
	 * 予約表示範囲を元に全コース、全種別の予約可能状況を取得
	 * 予約A情報取得(表示用)
	 * */
	
	
	// 単体取得(
		public List<ReservationAddModel> selectViewRevArray(JdbcTemplate jdbc 
				//, Integer seqno
				 ) throws DataAccessException {	
//			System.out.println("reservation_id :" + reservation_id );
//			System.out.println("reservation_id :" + reserv_course );
//			System.out.println("reservation_id :" + reserv_type_name );
			
			 String sql = "SELECT " +
					    "D.SEQNO, " +
					    "D.DATESTR, " +
					    "D.DATEEND, " +
					    "RS.RESERVATION_NAME, " +
					    "RS.RESERVE_CONDITION, " +
					    "RS.CANCEL_POLICY, " +
					    "RS.SET_UNIT, " +
					    "RS.TIME_STR, " +
					    "RS.TIME_END, " +
					    "RS.INP_PERSON, " +
					    "RS.REV_A_END, " +
					    "RS.RECEPTION_STR, " +
					    "RT.TYPE_GROUP_NAME, " +
					    "RC.RESERVE_COURSE, " +
					    "RT.TYPE_NAME, " +
					    "D.RESERVSTR, " +
					    "D.RESERVEND " +
					    "FROM " +
					    "M_RESERVATION_A RS " +
					    "JOIN T_RESERVATIONUSER D " +
					    "ON RS.RESERVATION_ID = D.RESERVATION_ID " +
					    "JOIN T_RESERVATIONCOURSE_A RC " +
					    "ON RS.RESERVATION_ID = RC.RESERVATION_ID " +
					    "AND D.RESERVE_COURSE = RC.SEQNO " +
					    "JOIN T_RESERVATIONSUB_A RT " +
					    "ON RS.RESERVATION_ID = RT.RESERVATION_ID " +
					    "WHERE " +
					    "D.DEL_FLG = 0 " +
					    "AND D.CANCEL_DATE IS NULL " +
					    "AND D.DATESTR >= RC.REV_COURSE_A_STR " +  // ① コースの開始日より後、開始時間より後
					    "AND D.DATESTR >= RT.TYPE_STR " +  // ② 種別の開始日より後、開始時間より後
					    "AND D.DATEEND >= D.RESERVSTR " +
					    "AND D.DATESTR <= D.RESERVEND " +
					    "AND D.DATEEND <= RS.REV_A_END " +  // ④ 予約Aの終了日より前
					    "AND D.DATEEND <= RC.REV_COURSE_A_END " +  // ⑤ コースの終了日より前、終了時間より前
					    "AND D.DATEEND <= RT.TYPE_END "; //+  // 種別の終了日より前、終了時間より前
			 			//"AND D.SEQNO = ? " ;
			 			//"AND D.SEQNO = ? " ;
			 
			 
					                     			
			List<Map<String, Object>> dataList = jdbc.queryForList(sql);//, seqno
			
			System.out.println("dataList :" + dataList );
			
		    List<ReservationAddModel> modelList = new ArrayList<>();
		    for (Map<String, Object> data : dataList) {
		    	
		    	ReservationAddModel model = setReservationArrayData(data);
		        modelList.add(model);
		    }
		    
		    System.out.println("modelList :" + modelList );
		  
		    return modelList;
		}	
		
		//ReservationDataの値、戻り値としてリストを返す
		private ReservationAddModel setReservationArrayData(Map<String, Object> map) {
		    ReservationAddModel model = new ReservationAddModel();
			//戻り値としてリストを返す	
		 
		    model.setSEQNO((Integer)map.get("seqno"));	
		    model.setRESERVATION_NAME((String) map.get("RESERVATION_NAME"));
		    model.setRESERVE_CONDITION((String) map.get("RESERVE_CONDITION"));	
		    model.setCANCEL_POLICY((String) map.get("CANCEL_POLICY"));  
		    model.setSET_UNIT((Integer) map.get("SET_UNIT"));  
		    model.setTIME_STR((String) map.get("TIME_STR"));	
		    model.setTIME_END((String) map.get("TIME_END"));	
		    model.setRECEPTION_STR((Integer) map.get("RECEPTION_STR"));	
		    model.setTYPE_GROUP_NAME((String) map.get("TYPE_GROUP_NAME"));		    
		    model.setRESERVE_COURSE((String) map.get("RESERVE_COURSE"));	
		    model.setTYPE_NAME((String) map.get("TYPE_NAME"));	
		    model.setINP_PERSON((String) map.get("INP_PERSON"));
		    //model.setREV_A_END((String) map.get("REV_A_END"));
		    if(Objects.nonNull(map.get("RESERVSTR")))
				model.setRESERVSTR(map.get("RESERVSTR").toString());
		    
		    if(Objects.nonNull(map.get("RESERVEND")))
				model.setRESERVEND(map.get("RESERVEND").toString());
		    
		    if(Objects.nonNull(map.get("DATESTR")))
				model.setDATESTR(map.get("DATESTR").toString());
		    
		    if(Objects.nonNull(map.get("DATEEND")))
				model.setDATEEND(map.get("DATEEND").toString());

		    if(Objects.nonNull(map.get("REV_A_END")))
				model.setREV_A_END(map.get("REV_A_END").toString());
		    
		    
		    System.out.println("model: " + model);
		    
	        return model;
		
			
		}

}
	