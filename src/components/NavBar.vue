<template>
    <div class="nav-bar">
      <i class="fas fa-map-marker-alt nav-icon" @click="$router.push('/mapa')"></i>
      <i class="fas fa-file-alt nav-icon" @click="$router.push('/aDecorrer')"></i>
  
      <div class="nav-circle" @click="$router.push('/home')">
        <i class="fas fa-home"></i>
      </div>
  
      <i class="fas fa-plus nav-icon" @click="$router.push('/novas')"></i>
      <i class="fas fa-user nav-icon" @click="$router.push('/perfil')"></i>
    </div>
  </template>
  
  <style scoped>
 .nav-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #132340;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 12px 0;
    border-top: 1px solid #1c2e4a;
    z-index: 10;
    height: 64px;
}

  
  .nav-icon {
    font-size: 20px;
    color: #bbb;
    width: 20%;
    text-align: center;
    cursor: pointer;
  }
  
  .nav-circle {
    background-color: #277aff;
    border-radius: 50%;
    padding: 14px;
    color: white;
    font-size: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    margin-top: -36px;
    z-index: 110;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 56px;
    height: 56px;
    cursor: pointer;
  }
  </style>
  