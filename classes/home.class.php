<?php

	class Home {

		static public function fallback($input) {

			$clean_input = DB::clean($input);

			$output = [
				'title' => 'Välkommen',
				'data'	=> $clean_input
			];
			
			return $output;

		}

	}