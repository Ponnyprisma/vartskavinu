<?php

	class Map {

		static public function fallback($input) {
			$clean_input = DB::clean($input);
			$_SESSION['lilledo'] = self::checkSession();

			$output = [
				'title' => 'Planera din resa - Vart ska vi nu?',
				'data'	=> $clean_input,
				'session' => $_SESSION['lilledo']
			];
			
			return $output;

		}

		public static function checkSession() {
			if(!isset($_SESSION['lilledo'])) {
				$sql = "INSERT INTO maps (id) VALUES (NULL);";
				$id = DB::query($sql);
				return $id;
			}
			else {
				
				return $_SESSION['lilledo'];
			}
		}

		public static function addMarker($post_data) {
			$clean_post_data = DB::clean($post_data);
			
			$map_id = self::checkSession();
			$marker_id = $clean_post_data['marker_id'];
			$lat = $clean_post_data['lat'];
			$lng = $clean_post_data['lng'];
			$address = $clean_post_data['address'];

			$sql = "SELECT id FROM markers WHERE map_id = $map_id AND marker_id = $marker_id";
			$existing_marker = DB::query($sql, true);

			if(!$existing_marker) {
				$sql = 'INSERT INTO markers (map_id, marker_id, lat, lng, address) VALUES ("'.$map_id.'", "'.$marker_id.'", "'.$lat.'", "'.$lng.'", "'.$address.'")';
				DB::query($sql);
			}

			die;

		}

		public static function deleteMarker($post_data) {
			$clean_post_data = DB::clean($post_data);

			$map_id = self::checkSession();
			$marker_id = $clean_post_data['marker_id'];

			$sql = 'DELETE FROM markers WHERE map_id = "'.$map_id.'" AND marker_id = "'.$marker_id.'"';
			DB::query($sql);
			die;
		}

		public static function updateMarker($post_data) {
			$clean_post_data = DB::clean($post_data);

			$map_id = self::checkSession();
			$marker_id = $clean_post_data['marker_id'];
			$lat = $clean_post_data['lat'];
			$lng = $clean_post_data['lng'];
			$address = $clean_post_data['address'];

			$sql = 'UPDATE markers SET lat = "'.$lat.'", lng = "'.$lng.'", address = "'.$address.'" WHERE map_id = "'.$map_id.'" AND marker_id = "'.$marker_id.'"';
			DB::query($sql);
			die;
		}

		public static function updateMarkerInfo($post_data) {
			$clean_post_data = DB::clean($post_data);

			$map_id = self::checkSession();
			$marker_id = $clean_post_data['marker_id'];
			$info = $clean_post_data['info'];

			$sql = 'UPDATE markers SET info = "'.$info.'" WHERE map_id = "'.$map_id.'" AND marker_id = "'.$marker_id.'"';
			DB::query($sql);
			die;
		}

		public static function getAllMarkers() {
			$map_id = self::checkSession();

			$sql = "SELECT * FROM markers WHERE map_id = $map_id ORDER BY marker_id ASC";
			$markers = DB::query($sql);
			echo json_encode($markers);
			die;
		}

		public static function getRoundTrip() {
			$map_id = self::checkSession();

			$sql = "SELECT round_trip FROM maps WHERE id = $map_id";
			$round_trip = DB::query($sql, true);
			echo json_encode($round_trip);
			die;
		}

		public static function changeRoundTrip() {
			$map_id = self::checkSession();

			$sql = "SELECT round_trip FROM maps WHERE id = $map_id";
			$data = DB::query($sql, true);
			
			if($data['round_trip'] == 0) {
				$round_trip = 1;
			}
			else {
				$round_trip = 0;
			}

			$sql = "UPDATE maps SET round_trip = $round_trip WHERE id = $map_id";
			DB::query($sql);
			die;
		}

		public static function setDate($post_data) {
			$clean_post_data = DB::clean($post_data);

			$map_id = self::checkSession();
			$marker_id = $clean_post_data['marker_id'];
			$type_of_trip = $clean_post_data['type_of_trip'];
			$date = $clean_post_data['date'];

			$sql = "UPDATE markers SET $type_of_trip = '$date' WHERE map_id = $map_id AND marker_id = $marker_id";
			DB::query($sql);
			echo $sql;
			die;

		}

		public static function login($post_data) {
			$clean_post_data = DB::clean($post_data);
			$id = $clean_post_data['id'] == true ? (int)$clean_post_data['id'] : 0;
			$sql = "SELECT id FROM maps WHERE id = ".$id;
			$data = DB::query($sql, true);
			if($data) {
				$_SESSION['lilledo'] = $data['id'];
				$output = ['redirect_url' => '/map/'];
			}
			else {
				$output = ['redirect_url' => '/?error=no_map_id'];
			}
	 		return $output;
			//die;

		}

		public static function logout() {
			session_destroy();
			$output = ['redirect_url' => '/'];
	 		return $output;
			die;
		}

	}







