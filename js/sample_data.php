 <?php 
 // Connects to your Database 
  mysql_connect("localhost", "USERNAME", "PASSWORD") or die(mysql_error()); 
  mysql_select_db("DB_NAME") or die(mysql_error());

   $data = mysql_query("SELECT * FROM __TABLENAME__") 
   or die(mysql_error()); 


$to_encode = array();
while($row = mysql_fetch_assoc($data)){
   $to_encode[] = $row;
}

echo json_encode ($to_encode);

 ?> 