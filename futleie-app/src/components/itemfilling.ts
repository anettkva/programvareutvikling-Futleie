import { Item } from "@/Types";
import supabaseClient from "@/supabaseClient";


/*
Funksjonene tar inn en itemList og setItemList

    Altså denne | og denne |       
                V          V
        const [items, setItems] = useState<Item[] | null>(null)
                                 |                             |
                                 -------------------------------
                                                |
                                                V
    --------------------------------------------------------------------------------------
   |Merk at det er VIKTIG at useState har type "Item[] | null" OG at den settes til null  |
   |                     !!!!!KODEN VIL KRÆSJE OM IKKE!!!!!                               |
    --------------------------------------------------------------------------------------

Deretter henter de ut bilder/brukere fra supabase,
legger disse i kopier av itemsene i items. og setter items til disse kopiene.

useStatene de brukes i har (og må ha) items som dependency selv om de muterer items,
så det brukes en Ref for å sørge for at useStatene slutter å kjøre etter items er fylt slik vi vil.
*/

const putImagesInItems = async (itemList: Item[] | null, setter: React.Dispatch<React.SetStateAction<Item[] | null>>) => {
    if (itemList) {
      let tempItemList = await Promise.all(itemList.map(async (item) => {
        const { data, error } = await supabaseClient
          .from("Item_images")
          .select("image_url")
          .eq("item_id", item.id);
        if (error) {
          console.log("Error fetching images");
          return item;
        }
        const updatedItem = item = {...item, images: data.map((images) => images.image_url)}
        return updatedItem;
        
      }))
      setter(tempItemList);
    }
};


const putOwnersInItems = async (itemList: Item[] | null, setter: React.Dispatch<React.SetStateAction<Item[] | null>>) => {
    if (itemList) {
    let tempItemList = await Promise.all(itemList.map(async (item) => {
        const { data, error } = await supabaseClient
        .from("Users")
        .select("username")
        .eq("id", item.owner_id);
        if (error) {
        console.log("Error fetching Owners");
        return item;
        }
        const updatedItem = item = {...item, owner: data[0].username}
        console.log("Updated item: ", updatedItem)
        return updatedItem;
        
    }))
    setter(tempItemList);
    }
};

export { putImagesInItems, putOwnersInItems };