<?php

	class Home {

		static public function fallback($input) {

			$clean_input = DB::clean($input);

			$output = [
				'title' => 'Var ska vi no - Lille.do',
				'data'	=> $clean_input
			];
			
			return $output;

		}

	}