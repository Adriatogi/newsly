from ml_modal_service import summarize, political_bias

if __name__ == "__main__":
    # Example usage
    text = """
    Power has been restored to tens of millions of people across almost all of Spain and Portugal, but disruptions to transport services were expected to stretch into a second day as questions mount over what caused a massive blackout.

Both countries remain under states of emergency after electrical supply was lost across the entire Iberian Peninsula, and in part of France, on Monday. The outage brought businesses to a standstill, halted elevators, knocked out traffic lights, and caused chaos on roads and in airports.

On Tuesday morning, Spain’s grid operator said power had been supplied to 99% of the country, but the transport minister warned some trains would not operate, or would run at a reduced capacity - including the high-speed rail network.

Late Monday, power had been restored to most of Portugal, with videos on social media showing people cheering at night as the lights came back on.

Spanish Prime Minister Pedro Sanchez said on Monday that authorities were still not sure what caused the blackout, as his Portuguese counterpart blamed Spain.

Portugal’s Prime Minister Luis Montenegro on Monday said he did not yet know what had caused the blackout, but it “did not originate in Portugal” and “everything indicates” the problem started in Spain.

The outage took out lighting and power sockets, and caused subway systems to suddenly fail. In Madrid, traffic piled up on the roads after the lights went out.

“I was driving and suddenly there was no traffic lights … It was a bit of a jungle,” Luis Ibáñez Jiménez told CNN. “I saw a massive bus coming, and I had to accelerate a lot to go past it.”

The blackout’s impact was dramatic: transport hubs were shuttered and governments in both countries, which share a population of around 60 million people, hastily arranged emergency meetings to coordinate a response.

A dark metro station in Madrid. Passengers filtered out of stations after the outage stopped trains.
A dark metro station in Madrid. Passengers filtered out of stations after the outage stopped trains. Burak Akbulut/Anadolu/Getty Images
Spain’s Interior Ministry declared a state of emergency in the regions of Andalucia, Extremadura, Murcia, La Rioja and Madrid. After a late-night cabinet meeting, Portugal’s Montenegro declared an energy crisis, with the country’s grid operator warning that fully restoring power would be a “complex operation.”

Earlier, Madrid’s Mayor José Luis Martinez Almeida asked residents of the Spanish capital to minimize their movements and only call emergency services if it was truly urgent. He also called on people to clear the roads for emergency workers. Later in the day, Madrid’s emergency services provider urged the government to declare a national emergency, and local leader Isabel Díaz Ayuso asked the country to deploy the army.

Antonio Costa – president of the European Council and Portugal’s former prime minister – said although the cause of the outage was not clear, there were “no indications” of a cyberattack.

An abandoned local market Vigo, northwest Spain. The Spanish government chaired an emergency meeting, but authorities warned it could take hours to restore power.
An abandoned local market Vigo, northwest Spain. The Spanish government chaired an emergency meeting, but authorities warned it could take hours to restore power. Miguel Riopa/AFP/Getty Images
João Faria Conceição, head of grid operator Redes Energéticas Nacionais (REN), said Portugal was badly affected because it imports electricity from Spain in the morning, because the neighboring nation is one hour ahead and electricity produced by its solar plants is cheaper than producing it internally, during those hours.

“We are peripheral,” Conceição told a news conference Monday evening. While Spain received support from France and Morocco, Portugal had no country to turn to for emergency supplies of electricity.

Passengers stand next to a halted train near Cordoba.
Passengers stand next to a halted train near Cordoba. Javier Soriano/AFP/Getty Images
Confusion grips major cities
Monday’s blackout hit a huge and busy swathe of southern Europe. Dozens of Iberian cities, like Madrid, Lisbon, Barcelona, Seville and Valencia, are major hubs for transport, finance and tourism. Two of the five busiest airports in the European Union in 2023 were Madrid’s and Barcelona’s, according to EU data.

For a few hours, modern routines were suspended: cash replaced card payments, police officers used arm signals to direct traffic, and restaurants, supermarkets and stores closed their doors. Madrid’s firefighters carried out 174 “elevator interventions” across the city on Monday, its Emergency Information Office said, and some shoppers stocked up on essentials and canned goods.

The worst-case scenarios appeared to have been averted, at least in the first hours of the blackout. Spain’s nuclear sites were declared operational and safe, while Portugal’s National Institute for Medical Emergencies said it had “activated its contingency plan,” running its telephone and IT systems through a back-up generator. Spain’s health ministry said the same process happened in hospitals there.

A metro station in Madrid was closed off with tape on Monday; the subway shut down in the capital, leaving passengers stranded.
A metro station in Madrid was closed off with tape on Monday; the subway shut down in the capital, leaving passengers stranded. Susana Vera/Reuters
But travel was hit harder. Flights at major airports in the region were suddenly delayed or canceled, with travelers scrambling to adapt; online flight trackers reported that several airports saw their frequent departures suddenly halted after midday. Portugal’s flag carrier TAP Air Portugal told people not to travel to the airport until further notice.

Ellie Kenny, a holidaymaker inside Lisbon’s Humberto Delgado airport, said hundreds of people were stood in the dark in lines, with no air conditioning or running water. Shops were only accepting cash, she told CNN.

Trains were also suspended in Spain. And darkness suddenly descended in subway tunnels; video posted on social media showed blackened train cars stuck in standstill on platforms in Madrid, where the metro was suspended and entrances to stations were taped off.

An online graph displaying real-time information on Spain's electricity demand shows a massive drop-off the moment power was knocked out in the country.
An online graph displaying real-time information on Spain's electricity demand shows a massive drop-off the moment power was knocked out in the country. Red Electrica
Sporting events were impacted too. Tennis fans at the Madrid Open filed out of courts after the outage caused play to be suspended.

Some parts of southern France, near the Spanish border, felt a more sporadic impact.

Emilie Grandidie, a spokeswoman for France’s electricity transmission operator RTE, told CNN there was “a small power cut” in the French Basque Country; “It lasted only a couple of minutes and was restored very quickly,” she said.

In downtown Lisbon, and in cities across the Iberian peninsula, dark traffic lights led to confusion on the roads.
In downtown Lisbon, and in cities across the Iberian peninsula, dark traffic lights led to confusion on the roads. Armando Franca/AP
For several hours on Monday, tens of millions of people were asking each other when power would return, and why it was knocked out in the first place.

Neither question was easy to answer. But once power returns, it could still take days to untangle the damage caused by Monday’s worrying blackout.

Spain’s transportation minister said medium and long-distance trains won’t resume service until at least Tuesday, and the impact of a huge backlog in flights could stretch throughout the week.
    """
    summary = summarize.remote(text)
    print("Summary:", summary)

    # bias = political_bias.remote(text)
    # print("Bias:", bias)
