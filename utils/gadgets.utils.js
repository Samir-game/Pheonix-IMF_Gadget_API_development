const codenames=["The Nightingale","The Kraken","Shadow Viper","Phantom Dart",
    "Iron Raven","Ghost Lantern","Silver Cobra","Obsidian Owl","Crimson Fang",
    "Titan Whisper"];

const getRandomCodename=()=>{
  const index=Math.floor(Math.random()*codenames.length);
  return codenames[index];
};

const getRandomProbability=()=>{
  const probability=Math.floor(Math.random()*100)+1;
  return probability+"%";
};

module.exports={
  getRandomCodename,
  getRandomProbability,
};
