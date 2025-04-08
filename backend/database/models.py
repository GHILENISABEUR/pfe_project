import json
from django.db import models, connection, transaction
from django.dispatch import receiver
from django.db.models.signals import pre_save, post_delete,post_save,pre_delete
import logging
from django.forms import ValidationError
from django.db.models import JSONField  
from gestionUI.models import WebSite

logger = logging.getLogger(__name__)


#CATEGORY

class Category(models.Model):
    name = models.CharField(max_length=100)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children')
    website = models.ForeignKey(WebSite, on_delete=models.CASCADE, related_name='categories') 
    def __str__(self):
        return self.name

    def delete(self, *args, **kwargs):
        new_category_id = kwargs.pop('new_category_id', None)  # Obtenez l'ID de la nouvelle catégorie à partir des arguments
        if new_category_id is not None:
            # Mettez à jour le category_id des tables associées
            self.tables.update(category_id=new_category_id)
        super().delete(*args, **kwargs)
@receiver(pre_delete, sender=Category)
def update_tables_on_category_delete(sender, instance, **kwargs):
    new_category_id = kwargs.get('new_category_id', None)
    if new_category_id is not None:
        # Mettez à jour le category_id des tables associées
        instance.tables.update(category_id=new_category_id)


#TABLE
    
class Table(models.Model):
    name = models.CharField(max_length=100)
    category = models.ForeignKey(Category, related_name='tables', on_delete=models.CASCADE, null=True)
   
    def __init__(self, *args, **kwargs):
        super(Table, self).__init__(*args, **kwargs)
        self.old_name = self.name

    def save(self, *args, **kwargs):
        creating = self._state.adding
        if creating:
            if Table.objects.filter(name=self.name).exists():
                logger.error(f"A table with the name '{self.name}' already exists.")
                raise ValidationError(f"A table with the name '{self.name}' already exists.")
        else:
            if self.old_name and self.old_name != self.name:
                if Table.objects.exclude(pk=self.pk).filter(name=self.name).exists():
                    logger.error(f"A table with the name '{self.name}' already exists.")
                    raise ValidationError(f"A table with the name '{self.name}' already exists.")

        super().save(*args, **kwargs)
        if creating:
            self.create_veritable_table()
            self.ensure_categories()
        else:
            if self.old_name and self.old_name != self.name:
                self.rename_veritable_table()
    
    def ensure_categories(self):
        if not self.category:
            default_category = Category.objects.create(name='Default')
            self.category = default_category

    def delete(self, *args, **kwargs):

        with transaction.atomic():
            self.fields.all().delete()
            self.datas.all().delete()
            self.delete_veritable_table()
            super().delete(*args, **kwargs)


    def create_veritable_table(self):
        table_name = self.get_normalized_name(self.name)
        try:
            with connection.cursor() as cursor:
                cursor.execute(f"CREATE TABLE IF NOT EXISTS {table_name} (id serial PRIMARY KEY);")
        except Exception as e:
            logger.error(f"Error creating table {table_name}: {e}")

    def rename_veritable_table(self):
        old_table_name = self.get_normalized_name(self.old_name)
        new_table_name = self.get_normalized_name(self.name)
        try:
            with connection.cursor() as cursor:
                cursor.execute(f"ALTER TABLE {old_table_name} RENAME TO {new_table_name};")
        except Exception as e:
            logger.error(f"Error renaming table from {old_table_name} to {new_table_name}: {e}")

    def delete_veritable_table(self):
        table_name = self.get_normalized_name(self.name)
        try:
            with connection.cursor() as cursor:
                cursor.execute(f"SELECT to_regclass('{table_name}') IS NOT NULL;")
                if cursor.fetchone()[0]:  # Only proceed if the table exists
                    cursor.execute(f"DROP TABLE IF EXISTS {table_name} CASCADE;")
        except Exception as e:
            logger.error(f"Error dropping table {table_name}: {e}")
            raise

    @staticmethod
    def get_normalized_name(name):
        return f"{name.lower().replace(' ', '_')}"

    @staticmethod
    def retrieve_veritable_table_data(table_name):
        normalized_table_name = Table.get_normalized_name(table_name)
        try:
            with connection.cursor() as cursor:
                cursor.execute(f"SELECT * FROM {normalized_table_name};")
                rows = cursor.fetchall()
            return rows
        except Exception as e:
            logger.error(f"Error retrieving data from table {normalized_table_name}: {e}")
            return []

@receiver(pre_save, sender=Table)
def set_old_name(sender, instance, **kwargs):
    if instance.pk:
        instance.old_name = Table.objects.get(pk=instance.pk).name

#FIELD
class FieldType(models.TextChoices):
    TEXT = 'TEXT', 'Text'
    INTEGER = 'INTEGER', 'Integer'
    DATE = 'DATE', 'Date'
    BOOLEAN = 'BOOLEAN', 'Boolean'
    LIST = 'LIST', 'List'
    IMAGE = 'IMAGE', 'Image'
    DECIMAL = 'DECIMAL', 'Decimal'

class Field(models.Model):
    name = models.CharField(max_length=100, null=True, blank=True)
    field_type = models.CharField(max_length=50, choices=FieldType.choices, default=FieldType.TEXT)
    table = models.ForeignKey(Table, related_name='fields', on_delete=models.CASCADE)
    list_values = models.JSONField(default=list, blank=True, null=True)
    referedFieldId = models.IntegerField(null=True, blank=True)
    is_foreign_key = models.BooleanField(default=False, null=True, blank=True)
    relatedField = models.CharField(max_length=100, null=True, blank=True)
    required = models.BooleanField(default=False)
    Date = models.DateTimeField(null=True, blank=True)
    def save(self, *args, **kwargs):
        creating = self._state.adding
        super().save(*args, **kwargs)
        if creating:
            self.add_field_to_veritable_table()


    def add_field_to_veritable_table(self):
        table_name = self.table.get_normalized_name(self.table.name)
        column_name = self.get_normalized_name(self.name)
        column_type = self.field_type
        referedFieldId=self.referedFieldId

        if self.field_type == FieldType.TEXT:
            column_type = 'TEXT'
        elif self.field_type == FieldType.INTEGER:
            column_type = 'INTEGER'
        elif self.field_type == FieldType.DATE:
            column_type = 'DATE'
        elif self.field_type == FieldType.BOOLEAN:
            column_type = 'BOOLEAN'
        elif self.field_type == FieldType.LIST:
            column_type = 'JSONB'
        elif self.field_type == FieldType.IMAGE:
            column_type = 'VARCHAR(255)'
        elif self.field_type == FieldType.DECIMAL:
            column_type = 'DECIMAL(10, 10)'
        try:
            with connection.cursor() as cursor:
                cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type};")
        except Exception as e:
            logger.error(f"Error adding column {column_name} to table {table_name}: {e}")

    
    @staticmethod
    def get_normalized_name(name):
        import re
        # Replace all non-alphanumeric characters with underscores
        normalized_name = re.sub(r'\W+', '_', name)
        return normalized_name.lower()

@receiver(post_save, sender=Field)
def update_field_in_veritable_table(sender, instance, **kwargs):
    if instance._old_name and instance._old_field_type:
        table_name = instance.table.get_normalized_name(instance.table.name)
        old_column_name = Field.get_normalized_name(instance._old_name)
        new_column_name = Field.get_normalized_name(instance.name)
        column_type_change = instance._old_field_type != instance.field_type

        try:
            with connection.cursor() as cursor:
                if instance._old_name != instance.name:
                    cursor.execute(f"ALTER TABLE {table_name} RENAME COLUMN {old_column_name} TO {new_column_name};")
                
                if column_type_change:
                    new_field_type = instance.get_column_type(instance.field_type)
                    cursor.execute(f"ALTER TABLE {table_name} ALTER COLUMN {new_column_name} TYPE {new_field_type};")
            
            # Update JSON fields in Data table
            update_json_fields(instance._old_name, new_column_name, table_name)

        except Exception as e:
            logger.error(f"Error updating column in table {table_name}: {e}")

def update_json_fields(old_field_name, new_field_name, table_name):
    with transaction.atomic():
        try:
            # Update the Data table JSON fields
            data_instances = Data.objects.filter(table__name=table_name)
            for data in data_instances:
                if old_field_name in data.details:
                    data.details[new_field_name] = data.details.pop(old_field_name)
                    data.save()

        except Exception as e:
            logger.error(f"Error updating JSON fields in Data table for {table_name}: {e}")

@receiver(pre_save, sender=Field)
def set_old_field_details(sender, instance, **kwargs):
    if instance.pk:
        old_instance = Field.objects.get(pk=instance.pk)
        instance._old_name = old_instance.name
        instance._old_field_type = old_instance.field_type
    else:
        instance._old_name = None
        instance._old_field_type = None

@receiver(post_delete, sender=Field)
def delete_field_from_veritable_table(sender, instance, **kwargs):
    with transaction.atomic():
        table_name = instance.table.get_normalized_name(instance.table.name)
        field_name = instance.get_normalized_name(instance.name)
        try:
            with connection.cursor() as cursor:
                # Attempt to drop the column from the actual database table
                cursor.execute(f"ALTER TABLE {table_name} DROP COLUMN IF EXISTS {field_name};")

            # Iterate through each Data instance related to the table
            for data in Data.objects.filter(table=instance.table):
                if field_name in data.details:
                    # Remove the field from the details JSON
                    del data.details[field_name]
                
                # If details are now empty, delete the Data instance
                if not data.details:
                    data.delete()  # This deletes the row from the Data table
                else:
                    # Save the updated Data instance only if details are not empty
                    data.save()

        except Exception as e:
            logger.error(f"Error while deleting field {field_name} from table {table_name}: {e}")



class Visuals(models.Model):
    name = models.CharField(max_length=255)
    data = JSONField(default=list)    # Example: Store list of dictionaries representing data rows
    type = models.CharField(max_length=255, null=True, blank=True) #table or form
    website = models.ForeignKey(WebSite, on_delete=models.CASCADE, related_name='visuals') 

    selectedFields = JSONField(null=True, blank=True, default=None)
    def __str__(self):
        return self.name
    

# DATA
class Data(models.Model):
    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name='datas')
    details = JSONField()
    real_table_id = models.IntegerField(null=True, blank=True)  # Store the ID from the real table

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        table_name = self.table.get_normalized_name(self.table.name)

        if is_new:
            real_table_id = self.insert_row_into_veritable_table(table_name)
            self.real_table_id = real_table_id  # Store the ID in the Data model
        else:
            # Update the veritable table first
            self.update_row_in_veritable_table(table_name)
            print("Updated successfully in veritable table")

        # Now, save the Data instance
        super().save(*args, **kwargs)

    def insert_row_into_veritable_table(self, table_name):
        details_dict = self.details if isinstance(self.details, dict) else {}

        if not details_dict:
            logger.error(f"No data provided for insertion into table {table_name}. Skipping insertion.")
            return None

        columns = ', '.join([self.table.get_normalized_name(key) for key in details_dict.keys()])
        values = []
        for key, value in details_dict.items():
            if isinstance(value, (dict, list)):
                value = json.dumps(value)
            elif isinstance(value, str) and self.table.fields.filter(name=key, field_type=FieldType.LIST).exists():
                value = json.dumps(value)
            values.append(value)
        placeholders = ', '.join(['%s'] * len(values))

        query = f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders}) RETURNING id;"

        logger.debug(f"Executing query: {query} with values {values}")

        try:
            with connection.cursor() as cursor:
                cursor.execute(query, values)
                real_table_id = cursor.fetchone()[0]  # Get the ID of the newly inserted row
                return real_table_id
        except Exception as e:
            logger.error(f"Error inserting row into {table_name}: {e}")
            return None

    def update_row_in_veritable_table(self, table_name):
        details_dict = self.details if isinstance(self.details, dict) else {}
        data_id = details_dict.pop('id', self.real_table_id)  # Use real_table_id if available

        if not details_dict:
            logger.error(f"No details provided for updating table {table_name}. Skipping update.")
            return

        set_clause = ', '.join([f"{self.table.get_normalized_name(key)} = %s" for key in details_dict])
        values = list(details_dict.values()) + [data_id]
        query = f"UPDATE {table_name} SET {set_clause} WHERE id = %s;"

        logger.debug(f"Executing query: {query} with values {values}")

        try:
            with connection.cursor() as cursor:
                cursor.execute(query, values)
                if cursor.rowcount == 0:
                    logger.warning(f"No rows updated. Does the row with id {data_id} exist in table {table_name}?")
        except Exception as e:
            logger.error(f"Error updating row in {table_name}: {e}")

    @staticmethod
    def get_normalized_name(name):
        return f"{name.lower().replace(' ', '_')}"

@receiver(post_delete, sender=Data)
def delete_data_from_veritable_table(sender, instance, **kwargs):
    table_name = instance.table.get_normalized_name(instance.table.name)
    real_table_id = instance.real_table_id  # Use the real_table_id for deletion

    if not real_table_id:
        logger.error(f"No real_table_id available for deletion in table {table_name}. Skipping deletion.")
        return

    with transaction.atomic():
        try:
            with connection.cursor() as cursor:
                # Check if the row exists before trying to delete it
                cursor.execute(f"SELECT EXISTS (SELECT 1 FROM {table_name} WHERE id = %s);", [real_table_id])
                if cursor.fetchone()[0]:
                    # Delete the row from the veritable table
                    cursor.execute(f"DELETE FROM {table_name} WHERE id = %s;", [real_table_id])
                else:
                    logger.error(f"No row found in {table_name} with ID {real_table_id}")
        except Exception as e:
            logger.error(f"Error deleting row from table {table_name}: {e}")
            raise