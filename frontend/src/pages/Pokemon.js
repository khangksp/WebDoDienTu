import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function PokemonAPI() {
  const [pokemonName, setPokemonName] = useState("");
  const [pokemonSprite, setPokemonSprite] = useState(null);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      if (!pokemonName) return;

      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
      if (!response.ok) throw new Error("Không tìm thấy Pokémon!");

      const data = await response.json();
      setPokemonSprite(data.sprites.front_default);
      setError("");
    } catch (err) {
      setPokemonSprite(null);
      setError(err.message);
    }
  };

  return (
    <div className="container text-center mt-4">
      <h2 className="mb-3">Tìm kiếm Pokémon</h2>

      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Nhập tên Pokémon..."
          value={pokemonName}
          onChange={(e) => setPokemonName(e.target.value)}
        />
        <button className="btn btn-primary" onClick={fetchData}>
          Tìm kiếm
        </button>
      </div>

      {error && <p className="text-danger">{error}</p>}

      {pokemonSprite && (
        <div>
          <img src={pokemonSprite} alt="Pokemon" className="img-fluid" style={{ width: "300px", height: "300px"}}/>
        </div>
      )}
    </div>
  );
}

export default PokemonAPI;
