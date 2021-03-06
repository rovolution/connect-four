connectFourApp.controller('GameBoardSectionCtrl', ['$rootScope', '$scope', 'gameStateManager', 'gameBoardClientSideModel', 'appConstantValues', 
	function($rootScope, $scope, gameStateManager, gameBoardClientSideModel, appConstantValues) {

		$scope.$watch(gameStateManager.getCurrentState, function(newState) {
			$scope.data = gameBoardClientSideModel.gameBoardData;
		});

		$scope.insertCheckerIntoColumn = function(colIndex) {
			var gameState = gameStateManager.getCurrentState();

			$rootScope.columnIsFull = false;

			if(gameState === appConstantValues.gameStates.INPROGRESS) {
				var currentPlayer = gameStateManager.getCurrentPlayer();

				var checkerInserted = gameBoardClientSideModel.insertChecker({
					playerType: currentPlayer.type,
					columnIndex: colIndex
				});

				if(checkerInserted) {
					gameStateManager.checkStateAndAdvanceGame();
				} else {
					$rootScope.columnIsFull = true;
				}
			}
		}

		$scope.isSlotSelected = function(slot) {
			if(slot.selectedPlayer) {
				return true;
			} else {
				return false;
			}
		}

		$scope.isSlotSelectedByRedPlayer = function(slot) {
			if(slot.selectedPlayer === appConstantValues.playerType.RED) {
				return true;
			} else {
				return false;
			}
		}

		$scope.isSlotSelectedByBlackPlayer = function(slot) {
			if(slot.selectedPlayer === appConstantValues.playerType.BLACK) {
				return true;
			} else {
				return false;
			}
		}
	}
]);

connectFourApp.controller('SelectGameTypeMenuCtrl', ['$scope', '$rootScope',
	function($scope, $rootScope) {
		
		$scope.takeTurns = function() {
			$rootScope.showSelectGameTypeMenu = false;
			$rootScope.showStartMenu = true;
		}

		$scope.playRemoteGame = function() {
			$rootScope.showSelectGameTypeMenu = false;
			$rootScope.showRemoteGameStartingMenu = true;
		}
	}
]);

connectFourApp.controller('RemoteGameStartingMenuCtrl', ['$scope', '$rootScope', 'socket', 'gameStateManager',
	function($scope, $rootScope, socket, gameStateManager) {
		
		$scope.createUser = function() {
			socket.emit('createUser', $scope.username);

			socket.on('userCreated', function(newUserData) {
				$scope.$apply(function() {
					$scope.userData = newUserData;
				});
			});

			//TODO: Server-side decides the player who will start
			socket.on('opponentFound', function(data) {
				$rootScope.showRemoteGameStartingMenu = false;

				gameStateManager.startNewRemoteGame({
					userInfo: data.userInfo,
					opponentInfo: data.opponentInfo,
					isStartingPlayer: data.isStartingPlayer
				});
			});
		}
	}
]);

connectFourApp.controller('MenusSectionCtrl', ['$scope', '$rootScope', 'gameStateManager', 'appConstantValues', 
	function($scope, $rootScope, gameStateManager, appConstantValues) {
		
		$rootScope.showSelectGameTypeMenu = true;

		$scope.$watch(gameStateManager.getCurrentState, function(newState) {
			if(newState === appConstantValues.gameStates.INPROGRESS || newState === appConstantValues.gameStates.WAITING) {
				$rootScope.showStartMenu = false;
				$rootScope.showGameInfo = true;
			}
		});	
	}
]);


connectFourApp.controller('StartMenuCtrl', ['$scope', 'gameStateManager', 'appConstantValues', 
	function($scope, gameStateManager, appConstantValues) {
		
		$scope.firstPlayer = appConstantValues.playerType.RED;
		$scope.secondPlayer = appConstantValues.playerType.BLACK;
		$scope.startingPlayer = appConstantValues.playerType.RED; // NOTE: Red player set to start by default but can be toggled

		$scope.start = function() {
			gameStateManager.startNewGame({
				startingPlayer: $scope.startingPlayer
			});
		}
	}
]);


connectFourApp.controller('GameInfoCtrl', ['$scope', 'gameStateManager', 'appConstantValues', 
	function($scope, gameStateManager, appConstantValues) {
		
		$scope.currentPlayer = gameStateManager.getCurrentPlayer();

		$scope.redPlayerScore = 0;
        $scope.blackPlayerScore = 0;
        $scope.numOfDraws = 0;

        $scope.inProgress = true;

		$scope.$watch(gameStateManager.getCurrentState, function(newState) {
			$scope.currentPlayer = gameStateManager.getCurrentPlayer();

			_resetScopeVariables();

			if(newState !== appConstantValues.gameStates.INPROGRESS) {
				$scope.inProgress = false;
			}

			switch(newState) {
				case appConstantValues.gameStates.WINNER:
					$scope.winner = $scope.currentPlayer.type;
					_updateWinnersScoreOnScope();
					break;
				case appConstantValues.gameStates.DRAW:
					$scope.isDraw = true;
					$scope.numOfDraws++;
					break;
				case appConstantValues.gameStates.WAITING:
					$scope.isWaiting = true;
					break;
				case appConstantValues.gameStates.OPPONENTWINS:
					$scope.isLooser = true;
					break;
				case appConstantValues.gameStates.OPPONENT_DISCONNECTS:
					$scope.opponentDisconnected = true;
					break;
			}
		});

		$scope.restart = function() {
			_resetScopeVariables();
			gameStateManager.restartGame();
		}

		$scope.playAgain = function() {
			_resetScopeVariables();
			gameStateManager.playAgain();	
		}

		$scope.isRedCurrentPlayer = function() {
			if($scope.currentPlayer.type === appConstantValues.playerType.RED) {
				return true;
			} else {
				return false;
			}
		}

		$scope.isBlackCurrentPlayer = function() {
			if($scope.currentPlayer.type === appConstantValues.playerType.BLACK) {
				return true;
			} else {
				return false;
			}
		}

		function _updateWinnersScoreOnScope() {
			if($scope.currentPlayer.type === appConstantValues.playerType.RED) {
				$scope.redPlayerScore++;
			} else {
				$scope.blackPlayerScore++;
			}
		}

		function _resetScopeVariables() {
			$scope.isWaiting = $scope.isLooser = $scope.isDraw = $scope.opponentDisconnected = false;
			$scope.winner = null;
			$scope.inProgress = true;
		}
	}
]);