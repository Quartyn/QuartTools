(function() {

  // #region Bonus Chest
  let PointsCheckInterval = 6000;
  let ClaimAfterAppearanceTimeout = 1000;

  fetch('https://raw.githubusercontent.com/Quartyn/QuartTools/main/configs/data.json')
  .then(response => response.json())
  .then(data => {
    let twitch = data['twitch'];
    let chestID = twitch['chest_id'];

    quartyn.log(`ID of the chest 'chest_id' is: ${chestID}`);
    
    setInterval(() => {
      if (settings.options['twChClaim'] !== 'on') return;
      if (chestID === null || chestID === undefined) return;

      let bonusChest = document.querySelector(chestID);
      if (bonusChest) {
        setTimeout(() => {
          bonusChest.click();
          // qStats('twChst');
          quartyn.success('Bonus points Chest was collected.');
        }, ClaimAfterAppearanceTimeout);
      }
    }, PointsCheckInterval);
    quartyn.log(`Autoclaim Bonus Points Activated`);
  }).catch(err => {
    q.err(err);
  });
  
  // #endregion

})(); // Finally Quartyn Verified - All Done