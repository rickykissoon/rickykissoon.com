import { useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { Info } from "~/components/Post";


export default function URLState() {
    const [searchParams, setSearchParams] = useSearchParams();

    const ITEMS_PER_PAGE = 5;

    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const countryParam = searchParams.get("country") || "";
    const typeParam = searchParams.get("type") || "";

    const selectedCountries = useMemo(
        () => (countryParam ? countryParam.split(",").map((s) => s.trim()).filter(Boolean) : []),
    [countryParam]);

    const selectedTypes = useMemo(
        () => (typeParam ? typeParam.split(",").map((s) => s.trim()).filter(Boolean) : []),
    [typeParam]);

    const allCountries = useMemo(
        () => Array.from(new Set(candies.map((c) => c.country))).sort(),
    []);

    const allTypes = useMemo(
        () => Array.from(new Set(candies.flatMap((c) => c.type))).sort(),
    []);

    const filtered = useMemo(() => {
        return candies.filter((c) => {
            const countryOK = selectedCountries.length === 0 || selectedCountries.includes(c.country);
            const typeOK = selectedTypes.length === 0 || c.type.some((t) => selectedTypes.includes(t));
            return countryOK && typeOK;
        });
    }, [selectedCountries, selectedTypes]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const clampedPage = Math.min(page, totalPages);
    const start = (clampedPage - 1) * ITEMS_PER_PAGE;
    const pageItems = filtered.slice(start, start + ITEMS_PER_PAGE);

    const setParam = (key: string, value: string | null) => {
        const next = new URLSearchParams(searchParams);
        if (value && value.length > 0) next.set(key, value);
        else next.delete(key);
        if (key !== "page") next.set("page", "1");

        setSearchParams(next, { preventScrollReset: true });
    };

    const goToPage = (p: number) => {
        const next = new URLSearchParams(searchParams);
        next.set("page", String(Math.min(Math.max(1, p), totalPages)));
        setSearchParams(next, { preventScrollReset: true });
    };

    const toggleMultiValue = (key: "country" | "type", value: string) => {
        const current = (searchParams.get(key) || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        const idx = current.indexOf(value);
        if (idx === -1) current.push(value);
        else current.splice(idx, 1);

        const joined = current.join(",");
        setParam(key, joined.length ? joined : null);
    };

    return(
        <div>
            <div>
                <h1 className="text-[25px] font-bold mb-5 text-center">URL As State</h1>
            </div>
            <p>
                State can be stored and accessed in the URL via the path or query params.
            </p>
            <br></br>
            <p>
                To illustrate the URL as a form of state I'm using <a target="_blank" href="https://reactrouter.com/api/components/Outlet"><span className="text-teal-500">{"<Outlet />"}</span></a> to
                render this "URL as State" section, as well as the other two sections in this blog post. Because each section is tied to a
                path, you can use the browser's back button or <a target="_blank" href="https://reactrouter.com/api/components/Links#links">{"<Link>"}</a>.
                No need to wire up some complicated state system to give the user that feature.
            </p>
            <br></br>
            <p>
                Query params allow for more complex behavior without navigating away from a particular path. State is still stored in
                the URL, but now the page is a bit more dynamic.
            </p>
            <br></br>
            <p>
                Here's a list of 100 candies from around the world. Both pagination
                and filtering happens via url query params. The list of candies is a JSON object hard coded to the page, so no database
                queries.
            </p>
            <br></br>

            <div className="flex flex-col gap-4 items-start my-6">
                <div className="border rounded px-3 py-2 text-center mx-auto">CANDY FILE</div>
                <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                        <span className="block text-sm font-semibold">Types</span>
                        <button type="button" className="text-xs underline"
                            onClick={() => setParam("type", null)}
                        >Clear types</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {allTypes.map((t) => {
                            const active = selectedTypes.includes(t);
                            return (
                                <button key={t} type="button" 
                                    onClick={() => toggleMultiValue("type", t)}
                                    className={
                                        "px-2 py-1 text-xs rounded border " +
                                        (active ? "bg-[#290701] border-[#480d02] text-[#ff4f30]" : "")
                                    }
                                >{t}</button>
                            );
                        })}
                    </div>
                </div>
            </div>


            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Countries</span>
                    <button type="button" className="text-xs underline"
                        onClick={() => setParam("country", null)}
                    >Clear Countries</button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {allCountries.map((c) => {
                        const active = selectedCountries.includes(c);
                        return (
                            <button key={c} type="button"
                                onClick={() => toggleMultiValue("country", c)}
                                className={
                                    "px-2 py-1 text-xs rounded border " +
                                    (active ? "bg-[#290701] border-[#480d02] text-[#ff4f30]": "")
                                }
                            >{c}</button>
                        );
                    })}
                </div>
            </div>

            <div className="flex items-center gap-3 justify-between my-6">
                <button className="border rounded px-3 py-2 disabled:opacity-50"
                    disabled={clampedPage <= 1}
                    onClick={() => goToPage(clampedPage - 1)}
                >Previous</button>
                <div className="text-sm">
                    Page {clampedPage} / {totalPages} • {filtered.length} result
                    {filtered.length === 1 ? "" : "s"}
                </div>
                <button className="border rounded px-3 py-2 disabled:opacity-50"
                    disabled={clampedPage >= totalPages}
                    onClick={() => goToPage(clampedPage + 1)}
                >Next</button>
            </div>

            <ul className="space-y-3">
                {pageItems.map((candy) => (
                    <li key={candy.name} className="border border-[#8d1a74] bg-[#0f020b] rounded-xl p-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h2 className="text-lg font-semibold text-[#c21f9e]">{candy.name}</h2>
                            <span className="text-sm opacity-70">{candy.country}</span>
                        </div>
                        <p className="text-sm mt-1">{candy.description}</p>
                        <div className="mt-2 flex gap-2 flex-wrap">
                            {candy.type.map((t) => (
                                <button key={t} 
                                    onClick={() => toggleMultiValue("type", t)}
                                    className={
                                        "text-xs border rounded px-2 py-1 " +
                                        (selectedTypes.includes(t) ? "bg-[#290701] border-[#480d02] text-[#ff4f30]" : "")
                                    }
                                >{t}</button>
                            ))}
                        </div>
                    </li>
                ))}
            </ul>

            <div className="flex items-center gap-3 justify-between mt-6">
                <button className="border rounded px-3 py-2 disabled:opacity-50"
                    disabled={clampedPage <= 1}
                    onClick={() => goToPage(clampedPage - 1)}
                >Previous</button>
                <div className="text-sm">
                    Page {clampedPage} / {totalPages} • {filtered.length} result
                    {filtered.length === 1 ? "" : "s"}
                </div>
                <button className="border rounded px-3 py-2 disabled:opacity-50"
                    disabled={clampedPage >= totalPages}
                    onClick={() => goToPage(clampedPage + 1)}
                >Next</button>
            </div>

            <div className="my-6">
              <Info title="How React Router Handles Query Updates"
                body={
                  <>
                    <p>In React Router, changing the query string is a client side navigation, not a full page reload. On query changes, React Router:</p>
                    <br></br>
                    <ul className="list-disc ml-3">
                      <li>Updates browser history</li>
                      <li>Resets scroll behavior by default</li>
                      <li>Revalidates loaders (more on this in the "Server as State" section)</li>
                    </ul>
                  </>
                }
              />
            </div>

            <div className="flex items-center gap-3 justify-between mt-6">
                <Link to="/blogs/web-state-with-react-router-7">Home</Link>
                <Link to="/blogs/web-state-with-react-router-7/server-state">2. Server as State</Link>
            </div>
        </div>
    );
}

function ComponentSnippet() {
  return(
      <pre><code>
{`export default function Candies() {
  const [searchParams, setSearchParams] = useSearchParams();

  const ITEMS_PER_PAGE = 5;

  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const countryParam = searchParams.get("country") || "";
  const typeParam = searchParams.get("type") || "";

  /* additional code.... */

  return <>content</>;
};`}    
      </code></pre>
  );
}

export type CandyType =
  | "chocolate"
  | "sugar"
  | "caramel"
  | "nougat"
  | "taffy"
  | "gum"
  | "licorice"
  | "marshmallow"
  | "peanut"
  | "mint"
  | "jelly"
  | "biscuit"
  | "wafer"
  | "toffee"
  | "fruit"
  | "hazelnut"
  | "almond"
  | "coconut"
  | "honeycomb"
  | "malt"
  | "rice"
  | "cereal"
  | "lollipop"
  | "hard candy"
  | "sour"
  | "fizzy"
  | "popping"
  | "cherry"
  | "rose";

export interface Candy {
  name: string;
  country: string;
  type: CandyType[];
  description: string;
}

export const candies: Candy[] = [
  {
    name: "Snickers",
    country: "United States",
    type: ["chocolate", "nougat", "caramel", "peanut"],
    description:
      "A chocolate bar with nougat, caramel, and peanuts covered in milk chocolate.",
  },
  {
    name: "Mars Bar",
    country: "United Kingdom",
    type: ["chocolate", "nougat", "caramel"],
    description: "A classic bar of nougat and caramel enrobed in milk chocolate.",
  },
  {
    name: "Twix",
    country: "United Kingdom",
    type: ["chocolate", "biscuit", "caramel"],
    description: "Crisp biscuit fingers topped with caramel and coated in chocolate.",
  },
  {
    name: "Kit Kat",
    country: "United Kingdom",
    type: ["chocolate", "wafer"],
    description: "Crisp wafer fingers covered in chocolate and made to be snapped and shared.",
  },
  {
    name: "Milky Way (US)",
    country: "United States",
    type: ["chocolate", "nougat", "caramel"],
    description: "A fluffy nougat center layered with caramel and coated in chocolate.",
  },
  {
    name: "3 Musketeers",
    country: "United States",
    type: ["chocolate", "nougat"],
    description: "A light, whipped chocolate nougat bar wrapped in milk chocolate.",
  },
  {
    name: "M&M's Milk Chocolate",
    country: "United States",
    type: ["chocolate"],
    description: "Candy-coated milk chocolate buttons in a rainbow of colors.",
  },
  {
    name: "M&M's Peanut",
    country: "United States",
    type: ["chocolate", "peanut"],
    description: "Candy-coated chocolates with a crunchy roasted peanut center.",
  },
  {
    name: "Reese's Peanut Butter Cups",
    country: "United States",
    type: ["chocolate", "peanut"],
    description: "Iconic cups of creamy peanut butter encased in milk chocolate.",
  },
  {
    name: "Hershey's Kisses",
    country: "United States",
    type: ["chocolate"],
    description: "Bite-sized, foil-wrapped drops of classic milk chocolate.",
  },
  {
    name: "Rolo",
    country: "United Kingdom",
    type: ["chocolate", "caramel"],
    description: "Small chocolate cups filled with soft, gooey caramel.",
  },
  {
    name: "Butterfinger",
    country: "United States",
    type: ["chocolate", "peanut"],
    description: "A crisp, flaky peanut butter core covered in chocolate.",
  },
  {
    name: "Baby Ruth",
    country: "United States",
    type: ["chocolate", "nougat", "peanut", "caramel"],
    description: "A chunky bar of peanuts, caramel, and nougat dipped in chocolate.",
  },
  {
    name: "PayDay",
    country: "United States",
    type: ["peanut", "caramel"],
    description: "A salty-sweet bar of roasted peanuts held together by caramel.",
  },
  {
    name: "Almond Joy",
    country: "United States",
    type: ["chocolate", "coconut", "almond"],
    description: "Sweet coconut topped with almonds and covered in milk chocolate.",
  },
  {
    name: "Mounds",
    country: "United States",
    type: ["chocolate", "coconut"],
    description: "Dark chocolate covering a moist, sweet coconut center.",
  },
  {
    name: "Twizzlers",
    country: "United States",
    type: ["sugar", "licorice"],
    description: "Chewy, twisted licorice-style ropes in fruity flavors.",
  },
  {
    name: "Red Vines",
    country: "United States",
    type: ["sugar", "licorice"],
    description: "Classic soft licorice twists known for their mild, sweet flavor.",
  },
  {
    name: "Skittles",
    country: "United States",
    type: ["sugar", "fruit"],
    description: "Chewy, fruit-flavored candies in colorful shells.",
  },
  {
    name: "Starburst",
    country: "United Kingdom",
    type: ["sugar", "fruit", "taffy"],
    description: "Individually wrapped chewy fruit squares bursting with flavor.",
  },
  {
    name: "Sour Patch Kids",
    country: "United States",
    type: ["sugar", "sour", "jelly"],
    description: "Soft gummies that are sour on the outside and sweet on the inside.",
  },
  {
    name: "Swedish Fish",
    country: "Sweden",
    type: ["sugar", "jelly"],
    description: "Iconic fish-shaped chewy candies with a distinctive berry flavor.",
  },
  {
    name: "Jelly Belly",
    country: "United States",
    type: ["sugar", "jelly"],
    description: "Gourmet jelly beans available in a vast array of inventive flavors.",
  },
  {
    name: "Werther's Original",
    country: "Germany",
    type: ["caramel", "toffee"],
    description: "Rich, buttery caramel candies with a smooth, creamy taste.",
  },
  {
    name: "Toblerone",
    country: "Switzerland",
    type: ["chocolate", "almond", "nougat"],
    description: "Triangular Swiss chocolate with honey and almond nougat.",
  },
  {
    name: "Lindor Truffles",
    country: "Switzerland",
    type: ["chocolate"],
    description: "Silky chocolate truffles with a smooth, melting center.",
  },
  {
    name: "Ferrero Rocher",
    country: "Italy",
    type: ["chocolate", "hazelnut", "wafer"],
    description: "Layered hazelnut chocolates with a crisp wafer shell and creamy center.",
  },
  {
    name: "Kinder Bueno",
    country: "Italy",
    type: ["chocolate", "wafer", "hazelnut"],
    description: "Crisp wafer bars filled with creamy hazelnut and covered in chocolate.",
  },
  {
    name: "Kinder Surprise",
    country: "Italy",
    type: ["chocolate"],
    description: "Milk chocolate eggs with a toy surprise inside.",
  },
  {
    name: "Aero",
    country: "United Kingdom",
    type: ["chocolate"],
    description: "Aerated chocolate with a bubbly texture that melts in the mouth.",
  },
  {
    name: "Nestlé Crunch",
    country: "United States",
    type: ["chocolate", "rice"],
    description: "Milk chocolate studded with crisped rice for a satisfying crunch.",
  },
  {
    name: "Milka Alpine Milk",
    country: "Germany",
    type: ["chocolate"],
    description: "Smooth Alpine milk chocolate known for its gentle, creamy taste.",
  },
  {
    name: "Cadbury Dairy Milk",
    country: "United Kingdom",
    type: ["chocolate"],
    description: "A classic creamy milk chocolate bar loved across the UK and beyond.",
  },
  {
    name: "Cadbury Flake",
    country: "United Kingdom",
    type: ["chocolate"],
    description: "Delicate, flaky ribbons of chocolate that crumble delightfully.",
  },
  {
    name: "Cadbury Twirl",
    country: "United Kingdom",
    type: ["chocolate"],
    description: "Twisted, layered chocolate fingers coated in a smooth shell.",
  },
  {
    name: "Bounty",
    country: "United Kingdom",
    type: ["chocolate", "coconut"],
    description: "Moist coconut filling covered in milk or dark chocolate.",
  },
  {
    name: "Maltesers",
    country: "United Kingdom",
    type: ["chocolate", "malt"],
    description: "Light, crunchy malted milk spheres coated in milk chocolate.",
  },
  {
    name: "Smarties (Nestlé, UK)",
    country: "United Kingdom",
    type: ["chocolate"],
    description: "Candy-coated chocolate discs popular across the UK and Europe.",
  },
  {
    name: "Smarties (US)",
    country: "United States",
    type: ["sugar"],
    description: "Tart, chalky rolls of compressed sugar tablets.",
  },
  {
    name: "Oh Henry!",
    country: "Canada",
    type: ["chocolate", "peanut", "caramel", "nougat"],
    description: "A hearty bar packed with peanuts, caramel, and fudgey nougat.",
  },
  {
    name: "Mr. Goodbar",
    country: "United States",
    type: ["chocolate", "peanut"],
    description: "Milk chocolate generously filled with roasted peanuts.",
  },
  {
    name: "Whoppers",
    country: "United States",
    type: ["chocolate", "malt"],
    description: "Crispy malted milk balls coated in a chocolatey shell.",
  },
  {
    name: "Charleston Chew",
    country: "United States",
    type: ["nougat", "chocolate"],
    description: "Vanilla, chocolate, or strawberry nougat bars covered in chocolate.",
  },
  {
    name: "Heath Bar",
    country: "United States",
    type: ["chocolate", "toffee"],
    description: "A thin, crunchy toffee bar coated in milk chocolate.",
  },
  {
    name: "Skor",
    country: "United States",
    type: ["chocolate", "toffee"],
    description: "A crisp butter toffee slab wrapped in smooth milk chocolate.",
  },
  {
    name: "York Peppermint Pattie",
    country: "United States",
    type: ["chocolate", "mint"],
    description: "Dark chocolate surrounding a cool, creamy peppermint center.",
  },
  {
    name: "After Eight",
    country: "United Kingdom",
    type: ["chocolate", "mint"],
    description: "Thin dark chocolate mints with a soft fondant center.",
  },
  {
    name: "Peppermint Crisp",
    country: "South Africa",
    type: ["chocolate", "mint"],
    description: "Crisp mint-flavored honeycomb shards coated in chocolate.",
  },
  {
    name: "Violet Crumble",
    country: "Australia",
    type: ["chocolate", "honeycomb"],
    description: "Brittle honeycomb toffee bar enrobed in milk chocolate.",
  },
  {
    name: "Cherry Ripe",
    country: "Australia",
    type: ["chocolate", "cherry", "coconut"],
    description: "Dark chocolate covering a moist cherry and coconut filling.",
  },
  {
    name: "Tim Tam",
    country: "Australia",
    type: ["chocolate", "biscuit"],
    description: "Chocolate-covered sandwich biscuits with a creamy filling.",
  },
  {
    name: "Pocky",
    country: "Japan",
    type: ["biscuit", "chocolate"],
    description: "Thin biscuit sticks dipped in chocolate or other flavors.",
  },
  {
    name: "Hi-Chew",
    country: "Japan",
    type: ["fruit", "taffy"],
    description: "Soft, long-lasting chewy candies with intense fruit flavors.",
  },
  {
    name: "Kasugai Gummies",
    country: "Japan",
    type: ["fruit", "jelly"],
    description: "Juicy, tender fruit gummies often made with real juice.",
  },
  {
    name: "Konpeitō",
    country: "Japan",
    type: ["sugar"],
    description: "Traditional star-shaped sugar candies with a crunchy bite.",
  },
  {
    name: "Black Thunder",
    country: "Japan",
    type: ["chocolate", "biscuit"],
    description: "A chunky bar of chocolate with cocoa biscuit pieces for extra crunch.",
  },
  {
    name: "Choco Pie (Orion)",
    country: "South Korea",
    type: ["chocolate", "marshmallow", "biscuit"],
    description: "Marshmallow-filled chocolate pies with soft cake-like biscuits.",
  },
  {
    name: "Pepero",
    country: "South Korea",
    type: ["biscuit", "chocolate"],
    description: "Crunchy biscuit sticks coated in chocolate or nut toppings.",
  },
  {
    name: "Chupa Chups",
    country: "Spain",
    type: ["sugar", "lollipop"],
    description: "Colorful lollipops in dozens of classic and novelty flavors.",
  },
  {
    name: "Mentos",
    country: "Netherlands",
    type: ["sugar", "mint"],
    description: "Chewy dragees known for their fresh mint and fruity varieties.",
  },
  {
    name: "Alpenliebe",
    country: "Italy",
    type: ["caramel", "toffee"],
    description: "Creamy caramel candies with a smooth, milky taste.",
  },
  {
    name: "Hanuta",
    country: "Germany",
    type: ["wafer", "hazelnut", "chocolate"],
    description: "Hazelnut chocolate cream sandwiched between crisp wafers.",
  },
  {
    name: "Knoppers",
    country: "Germany",
    type: ["wafer", "hazelnut", "chocolate"],
    description: "Layered wafer bars with milk and hazelnut cream and a chocolate base.",
  },
  {
    name: "Ritter Sport",
    country: "Germany",
    type: ["chocolate"],
    description: "Square German chocolate bars with clean breaks and many flavors.",
  },
  {
    name: "Daim",
    country: "Sweden",
    type: ["chocolate", "toffee", "almond"],
    description: "Crunchy almond toffee pieces coated in milk chocolate.",
  },
  {
    name: "Marabou Milk Chocolate",
    country: "Sweden",
    type: ["chocolate"],
    description: "Smooth Swedish milk chocolate with a mellow sweetness.",
  },
  {
    name: "Dumle",
    country: "Finland",
    type: ["chocolate", "toffee"],
    description: "Soft toffees covered in milk chocolate, individually wrapped.",
  },
  {
    name: "Fazer Geisha",
    country: "Finland",
    type: ["chocolate", "hazelnut"],
    description: "Milk chocolate with a delicate hazelnut filling.",
  },
  {
    name: "Turkish Delight (Lokum)",
    country: "Turkey",
    type: ["jelly", "rose"],
    description: "Soft, fragrant jellies often dusted with sugar and flavored with rose.",
  },
  {
    name: "Loukoumi",
    country: "Greece",
    type: ["jelly", "sugar"],
    description: "Greek-style Turkish delight in assorted flavors and pastel colors.",
  },
  {
    name: "Bar One",
    country: "South Africa",
    type: ["chocolate", "caramel", "nougat"],
    description: "A substantial bar of caramel and nougat coated in chocolate.",
  },
  {
    name: "Beacon Fizzers",
    country: "South Africa",
    type: ["taffy", "fruit"],
    description: "Tangy, chewy taffies that fizz slightly as you eat them.",
  },
  {
    name: "Fox's Glacier Mints",
    country: "United Kingdom",
    type: ["mint", "sugar"],
    description: "Clear, slow-dissolving hard mints with a crisp flavor.",
  },
  {
    name: "Rowntree's Fruit Pastilles",
    country: "United Kingdom",
    type: ["fruit", "jelly"],
    description: "Soft, sugar-dusted fruit jellies with bold flavors.",
  },
  {
    name: "Rowntree's Fruit Gums",
    country: "United Kingdom",
    type: ["fruit", "jelly"],
    description: "Firm, chewy fruit gummies with long-lasting flavor.",
  },
  {
    name: "Maynards Wine Gums",
    country: "United Kingdom",
    type: ["fruit", "jelly"],
    description: "Chewy, firm fruit candies traditionally stamped with wine names.",
  },
  {
    name: "Jelly Babies",
    country: "United Kingdom",
    type: ["fruit", "jelly"],
    description: "Baby-shaped soft jellies with a tender bite and sugary coating.",
  },
  {
    name: "Tunnock's Caramel Wafer",
    country: "United Kingdom",
    type: ["wafer", "caramel", "chocolate"],
    description: "Layered wafers and caramel coated in chocolate, wrapped in foil.",
  },
  {
    name: "Tunnock's Tea Cake",
    country: "United Kingdom",
    type: ["marshmallow", "biscuit", "chocolate"],
    description: "A biscuit base topped with marshmallow and covered in chocolate.",
  },
  {
    name: "Kinder Country",
    country: "Italy",
    type: ["chocolate", "cereal"],
    description: "Milk chocolate with crisp cereal pieces and a creamy center.",
  },
  {
    name: "Prince Polo",
    country: "Poland",
    type: ["wafer", "chocolate"],
    description: "Thick layered wafers covered in chocolate, popular in Central Europe.",
  },
  {
    name: "E. Wedel Ptasie Mleczko",
    country: "Poland",
    type: ["marshmallow", "chocolate"],
    description: "Soft, mousse-like marshmallows enrobed in chocolate.",
  },
  {
    name: "SweeTarts",
    country: "United States",
    type: ["sugar", "sour"],
    description: "Tart, tangy candies that balance sweet and sour flavors.",
  },
  {
    name: "Nerds",
    country: "United States",
    type: ["sugar"],
    description: "Tiny, crunchy pebbles of intensely flavored sugar candy.",
  },
  {
    name: "Gobstopper",
    country: "United States",
    type: ["sugar", "hard candy"],
    description: "Jawbreaker candies with multiple colorful layers.",
  },
  {
    name: "Runts",
    country: "United States",
    type: ["sugar", "fruit"],
    description: "Fruit-shaped hard candies with bright, artificial flavors.",
  },
  {
    name: "Laffy Taffy",
    country: "United States",
    type: ["taffy", "fruit"],
    description: "Chewy, stretchy taffy pieces known for jokes on the wrapper.",
  },
  {
    name: "Airheads",
    country: "United States",
    type: ["taffy", "fruit"],
    description: "Tangy, stretchy taffy bars in vibrant fruit flavors.",
  },
  {
    name: "Jolly Rancher",
    country: "United States",
    type: ["sugar", "hard candy", "fruit"],
    description: "Bold, long-lasting hard candies with intense fruit flavors.",
  },
  {
    name: "Life Savers",
    country: "United States",
    type: ["sugar", "mint", "fruit"],
    description: "Ring-shaped hard candies available in mint and fruit varieties.",
  },
  {
    name: "Zotz",
    country: "Italy",
    type: ["sugar", "sour", "fizzy"],
    description: "Hard candies with a fizzy, tart center that foams in your mouth.",
  },
  {
    name: "Pop Rocks",
    country: "United States",
    type: ["sugar", "popping"],
    description: "Carbonated candy crystals that crackle and pop on the tongue.",
  },
  {
    name: "PEZ",
    country: "Austria",
    type: ["sugar"],
    description: "Rectangular pressed candies dispensed from collectible PEZ dispensers.",
  },
  {
    name: "Haribo Goldbears",
    country: "Germany",
    type: ["jelly", "fruit"],
    description: "Classic gummy bears with a chewy bite and fruity flavors.",
  },
  {
    name: "Maoam",
    country: "Germany",
    type: ["taffy", "fruit"],
    description: "Chewy fruit candies available as blocks, stripes, and pinballs.",
  },
  {
    name: "Toffee Crisp",
    country: "United Kingdom",
    type: ["chocolate", "caramel", "rice"],
    description: "Crisped rice and caramel wrapped in milk chocolate.",
  },
  {
    name: "Lion",
    country: "United Kingdom",
    type: ["chocolate", "wafer", "caramel", "cereal"],
    description: "A chunky bar with wafer, caramel, and crunchy cereal pieces in chocolate.",
  },
  {
    name: "Picnic",
    country: "United Kingdom",
    type: ["chocolate", "peanut", "wafer", "caramel"],
    description: "A rugged mix of peanuts, wafer, and caramel coated in chocolate.",
  },
  {
    name: "Boost",
    country: "United Kingdom",
    type: ["chocolate", "caramel", "biscuit"],
    description: "A dense caramel and biscuit center covered in milk chocolate.",
  },
  {
    name: "Crunchie",
    country: "United Kingdom",
    type: ["chocolate", "honeycomb"],
    description: "A bar of aerated honeycomb toffee encased in milk chocolate.",
  },
];