<?php

	class Home {

		static public function fallback($input) {

			$clean_input = DB::clean($input);

			if(isset($_SESSION['lilledo'])) {
				$output = ['redirect_url' => '/map/'];
				return $output;
				die;
			}
			else {
				$output = [
					'title' => 'Vart ska vi nu?',
					'data'	=> $clean_input
				];
				return $output;
			}			

		}

	}