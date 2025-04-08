from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('database', '0012_visuals_selectedfields'),
    ]

    operations = [
        migrations.AddField(
            model_name='field',
            name='is_foreign_key',
            field=models.BooleanField(default=False),
        ),]