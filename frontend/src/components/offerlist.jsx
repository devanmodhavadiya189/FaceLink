const Offerlist = ({ offers, onanswerclick }) => (
  <div className="offersection">
    <h3>available calls</h3>
    {offers.length === 0 ? (
      <p>no incoming calls</p>
    ) : (
      offers.map((offer, index) => (
        <div key={index} className="offeritem">
          <span>{offer.offererusername}</span>
          <button className="btn offerbtn" onClick={() => onanswerclick(offer)}>
            answer
          </button>
        </div>
      ))
    )}
  </div>
);

export default Offerlist;