'use client';

interface ResumeGameSession {
  tokenId: bigint;
  currentRoom: number;
  currentHP: number;
  gems: number;
}

interface ResumeGameDialogProps {
  session: ResumeGameSession;
  onResume: () => void;
}

export function ResumeGameDialog({ session, onResume }: ResumeGameDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-purple-900 to-purple-950 border-2 border-purple-500 rounded-lg p-6 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Active Game Found!</h2>

        <div className="bg-black/40 rounded-lg p-4 mb-6">
          <p className="text-gray-300 mb-3">
            You have an unfinished game. Resume your adventure!
          </p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Current Room:</p>
              <p className="text-white font-bold">{session.currentRoom}</p>
            </div>
            <div>
              <p className="text-gray-400">HP:</p>
              <p className="text-red-400 font-bold">{session.currentHP}</p>
            </div>
            <div>
              <p className="text-gray-400">Gems:</p>
              <p className="text-blue-400 font-bold">{session.gems}</p>
            </div>
            <div>
              <p className="text-gray-400">NFT ID:</p>
              <p className="text-purple-400 font-bold">#{session.tokenId.toString()}</p>
            </div>
          </div>
        </div>

        <button
          onClick={onResume}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-500/50"
        >
          Resume Game
        </button>

        <p className="text-xs text-gray-400 mt-4 text-center">
          You can exit the dungeon safely or confirm your death from within the game.
        </p>
      </div>
    </div>
  );
}
