<?php

	class Home {

		static public function fallback($input) {

			$clean_input = DB::clean($input);

			$output = [
				'title' => 'Vær Ska Vi NOOOOOO?',
				'data'	=> $clean_input
			];
			
			return $output;

		}

	}